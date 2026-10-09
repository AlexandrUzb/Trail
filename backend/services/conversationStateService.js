import { cyrillicToLatin, normalizeSearchText } from '../utils/transliterate.js';

export const CONVERSATION_STATES = {
  GENERAL: 'GENERAL',
  ISSUE_IDENTIFIED: 'ISSUE_IDENTIFIED',
  FACT_GATHERING: 'FACT_GATHERING',
  LEGAL_ANALYSIS: 'LEGAL_ANALYSIS',
  ACTION_GUIDANCE: 'ACTION_GUIDANCE',
  DOCUMENT_GENERATION: 'DOCUMENT_GENERATION',
  FOLLOW_UP: 'FOLLOW_UP',
  NEW_CASE: 'NEW_CASE',
  ARTICLE_LOOKUP: 'ARTICLE_LOOKUP',
  SOURCE_REQUEST: 'SOURCE_REQUEST'
};

export class ConversationStateService {
  /**
   * Reconstructs or updates the active case state from conversation history and current message.
   */
  trackState(rawMessage, history = []) {
    const clean = (rawMessage || '').trim();
    const latin = cyrillicToLatin(normalizeSearchText(clean)).toLowerCase();

    // Default empty state
    const state = {
      state: CONVERSATION_STATES.GENERAL,
      isTopicSwitch: false,
      isFollowUp: false,
      isFirstTurn: !Array.isArray(history) || history.length === 0,
      active_case: {
        active: false,
        domain: null,
        issue: null,
        parties: { user_role: null, target_role: null },
        facts: {
          contract_status: 'unknown',
          duration: null,
          due_date: null,
          amount: null,
          fine_issuer: null,
          complaint_target: null,
          uncertain_facts: []
        },
        pending_question: null,
        turn_count: 0
      }
    };

    if (!Array.isArray(history) || history.length === 0) {
      return state;
    }

    // Step 1: Reconstruct context from previous turns
    let prevDomain = null;
    let prevIssue = null;
    let prevPendingQuestion = null;
    const accumulatedFacts = { ...state.active_case.facts };
    const accumulatedParties = { ...state.active_case.parties };

    for (let i = 0; i < history.length; i++) {
      const h = history[i];
      const text = (h.text || '').toLowerCase();
      const hLatin = cyrillicToLatin(normalizeSearchText(text)).toLowerCase();

      if (h.sender === 'user') {
        // Domain identification from user
        if (hLatin.includes('oylik') || hLatin.includes('maosh') || hLatin.includes('mehnat') || hLatin.includes('ish beruvchi') || hLatin.includes('ishdan bo')) {
          prevDomain = 'labor';
          accumulatedParties.user_role = 'employee';
          accumulatedParties.target_role = 'employer';
          if (hLatin.includes('oylik') || hLatin.includes('maosh')) prevIssue = 'unpaid_salary';
          if (hLatin.includes('bo\'shat') || hLatin.includes('boshat')) prevIssue = 'wrongful_dismissal';
        } else if (hLatin.includes('ijara') || hLatin.includes('kvartira') || hLatin.includes('uy egasi') || hLatin.includes('depozit')) {
          prevDomain = 'civil_tenancy';
          accumulatedParties.user_role = 'tenant';
          accumulatedParties.target_role = 'landlord';
          if (hLatin.includes('depozit')) prevIssue = 'deposit_return';
          if (hLatin.includes('chiqarib')) prevIssue = 'eviction';
        } else if (hLatin.includes('jarima') || hLatin.includes('radar') || hLatin.includes('yhxx')) {
          prevDomain = 'administrative';
          prevIssue = 'administrative_fine';
        } else if (hLatin.includes('shikoyat') || hLatin.includes('ariza')) {
          if (!prevDomain) prevDomain = 'complaint';
        }

        // Facts extraction
        const durationMatch = hLatin.match(/(\d+)\s*(oy|kun|yil|hafta)/);
        if (durationMatch) {
          accumulatedFacts.duration = `${durationMatch[1]} ${durationMatch[2]}`;
        }
        if (hLatin.includes('rasmiy shartnoma bor') || hLatin.includes('shartnomam bor') || (hLatin === 'ha' && prevPendingQuestion === 'contract_status')) {
          accumulatedFacts.contract_status = 'official';
        }
        if (hLatin.includes('shartnoma yo\'q') || (hLatin === 'yo\'q' && prevPendingQuestion === 'contract_status')) {
          accumulatedFacts.contract_status = 'informal';
        }
      } else if (h.sender === 'ai') {
        // Pending question identification from AI
        if (text.includes('qaysi organ') || text.includes('mansabdor shaxs chiqargan')) {
          prevPendingQuestion = 'fine_issuer';
        } else if (text.includes('qaysi masala bo‘yicha shikoyat') || text.includes('qaysi turdagi shikoyat') || text.includes('qaysi masala bo‘yicha murojaat') || text.includes('masalaga qarab farq qiladi')) {
          prevPendingQuestion = 'legal_area';
        } else if (text.includes('nizo qaysi masalaga oid') || text.includes('nizo qaysi masalaga tegishli') || text.includes('sudga murojaat qilmoqchi ekaningizni tushundim')) {
          prevPendingQuestion = 'court_dispute_type';
        } else if (text.includes('mehnat nizolari bo‘yicha komissiyaga') || text.includes('komissiya qaror chiqarganmi')) {
          prevPendingQuestion = 'labor_commission_facts';
        } else if (text.includes('shartnomangiz rasmiy') || text.includes('mehnat shartnomangiz bormi')) {
          prevPendingQuestion = 'contract_status';
        } else if (text.includes('nizoyingiz aynan qaysi masalaga tegishli') || text.includes('aynan nimani bilmoqchisiz')) {
          prevPendingQuestion = 'dispute_type';
        } else if (text.includes('qachon to‘lanishi kerak') || text.includes('necha oydan beri')) {
          prevPendingQuestion = 'duration_or_date';
        }
      }
    }

    // Step 2: Check for Topic Switch in Current Message
    // e.g. User was discussing labor salary, now asks about tenancy deposit or car
    const currentIsTenancy = /(ijara|kvartira|uy\s*egasi|depozit(ini)?|arendator)/i.test(latin);
    const currentIsLabor = /(oylik|maosh|ish\s*beruvchi|xodim|patron|mehnat|ishdan\s*bo['‘`]?sh)/i.test(latin);
    const currentIsCriminal = /(pora|korrupsiya|o['‘`]?g['‘`]?rilik|firibgar)/i.test(latin);

    let isTopicSwitch = false;
    if (prevDomain === 'labor' && currentIsTenancy && !currentIsLabor) {
      isTopicSwitch = true;
    } else if (prevDomain === 'civil_tenancy' && currentIsLabor && !currentIsTenancy) {
      isTopicSwitch = true;
    } else if (latin.includes('boshqa masala') || latin.includes('boshqa mavzu') || latin.includes('yana bir boshqa')) {
      isTopicSwitch = true;
    }

    if (isTopicSwitch) {
      state.isTopicSwitch = true;
      state.state = CONVERSATION_STATES.NEW_CASE;
      state.active_case = {
        active: true,
        domain: currentIsTenancy ? 'civil_tenancy' : (currentIsLabor ? 'labor' : (currentIsCriminal ? 'criminal' : null)),
        issue: currentIsTenancy ? (latin.includes('depozit') ? 'deposit_return' : 'tenancy_dispute') : null,
        parties: currentIsTenancy ? { user_role: 'tenant', target_role: 'landlord' } : {},
        facts: {
          contract_status: 'unknown',
          duration: null,
          due_date: null,
          amount: null,
          fine_issuer: null,
          complaint_target: null,
          uncertain_facts: []
        },
        pending_question: null,
        turn_count: 1
      };
      return state;
    }

    // Step 3: Handle short follow-up answers to previous questions
    const isShortAnswer = latin.split(/\s+/).length <= 4;
    let isFollowUp = false;

    if (prevPendingQuestion && isShortAnswer) {
      isFollowUp = true;
      state.isFollowUp = true;
      state.state = CONVERSATION_STATES.FOLLOW_UP;

      if (prevPendingQuestion === 'fine_issuer') {
        if (latin.includes('mehnat inspeksiya') || latin.includes('mehnat inspektori')) {
          accumulatedFacts.fine_issuer = 'labor_inspectorate';
        } else if (latin.includes('yhxx') || latin.includes('radar') || latin.includes('gai')) {
          accumulatedFacts.fine_issuer = 'traffic_police';
        } else if (latin.includes('soliq')) {
          accumulatedFacts.fine_issuer = 'tax_authority';
        } else if (latin.includes('sud')) {
          accumulatedFacts.fine_issuer = 'court';
        }
      } else if (prevPendingQuestion === 'complaint_target' || prevPendingQuestion === 'legal_area') {
        if (latin.includes('davlat organ') || latin.includes('davlat tashkilot')) {
          accumulatedFacts.complaint_target = 'government_agency';
        } else if (latin.includes('ish beruvchi') || latin.includes('mehnat')) {
          prevDomain = 'labor';
          accumulatedFacts.complaint_target = 'employer';
          accumulatedParties.user_role = 'employee';
          accumulatedParties.target_role = 'employer';
        } else if (latin.includes('sud')) {
          accumulatedFacts.complaint_target = 'court';
        }
      } else if (prevPendingQuestion === 'court_dispute_type') {
        if (latin.includes('mehnat') || latin.includes('ishdan') || latin.includes('maosh') || latin.includes('ish haqi')) {
          prevDomain = 'labor';
          accumulatedParties.user_role = 'employee';
          accumulatedParties.target_role = 'employer';
        }
      } else if (prevPendingQuestion === 'labor_commission_facts') {
        if (latin.includes('qaror') || latin.includes('chiqardi') || latin.includes('chiqargan') || latin.includes('bor')) {
          accumulatedFacts.commission_status = 'decision_received';
        } else if (latin.includes('kormadi') || latin.includes('ko‘rmadi')) {
          accumulatedFacts.commission_status = 'not_resolved_10_days';
        }
      } else if (prevPendingQuestion === 'contract_status') {
        if (latin === 'ha' || latin.includes('bor') || latin.includes('rasmiy')) {
          accumulatedFacts.contract_status = 'official';
        } else if (latin === 'yo\'q' || latin.includes('yoq') || latin.includes('norasmiy')) {
          accumulatedFacts.contract_status = 'informal';
        }
      } else if (prevPendingQuestion === 'dispute_type') {
        if (latin.includes('depozit')) {
          prevIssue = 'deposit_return';
        } else if (latin.includes('chiqarib') || latin.includes('uydan')) {
          prevIssue = 'eviction';
        }
      } else if (prevPendingQuestion === 'duration_or_date') {
        accumulatedFacts.duration = clean;
      }
    }

    // Current message extra facts extraction
    const currentDurationMatch = latin.match(/(\d+)\s*(oy|kun|yil|hafta)/);
    if (currentDurationMatch) {
      accumulatedFacts.duration = `${currentDurationMatch[1]} ${currentDurationMatch[2]}`;
    }
    if (latin.includes('rasmiy shartnoma') || latin.includes('shartnomam bor')) {
      accumulatedFacts.contract_status = 'official';
    }

    state.active_case = {
      active: Boolean(prevDomain || currentIsLabor || currentIsTenancy || currentIsCriminal),
      domain: prevDomain || (currentIsLabor ? 'labor' : (currentIsTenancy ? 'civil_tenancy' : null)),
      issue: prevIssue,
      parties: accumulatedParties,
      facts: accumulatedFacts,
      pending_question: prevPendingQuestion,
      turn_count: history.length + 1
    };

    return state;
  }
}

export const conversationStateService = new ConversationStateService();
