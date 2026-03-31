import type { ResolvedNamespace } from "@/i18n/resolve-namespace";

export function labelSupportCategory(t: ResolvedNamespace<"dashboard">, value: string): string {
  switch (value) {
    case "general":
      return t.supportCategoryGeneral;
    case "booking_issue":
      return t.supportCategoryBookingIssue;
    case "payment_issue":
      return t.supportCategoryPaymentIssue;
    case "account_issue":
      return t.supportCategoryAccountIssue;
    case "feature_request":
      return t.supportCategoryFeatureRequest;
    case "other":
      return t.supportCategoryOther;
    default:
      return value.replace(/_/g, " ");
  }
}

export function labelSupportCaseStatus(t: ResolvedNamespace<"dashboard">, status: string): string {
  switch (status) {
    case "open":
      return t.supportCaseStatusOpen;
    case "in_progress":
      return t.supportCaseStatusInProgress;
    case "waiting_on_salon":
      return t.supportCaseStatusWaitingOnYou;
    case "resolved":
      return t.supportCaseStatusResolved;
    case "closed":
      return t.supportCaseStatusClosed;
    default:
      return status;
  }
}

export function labelSupportPriority(t: ResolvedNamespace<"dashboard">, priority: string): string {
  switch (priority) {
    case "critical":
      return t.supportPriorityCritical;
    case "high":
      return t.supportPriorityHigh;
    case "medium":
      return t.supportPriorityMedium;
    case "low":
      return t.supportPriorityLow;
    default:
      return priority;
  }
}

export function labelFeedbackType(t: ResolvedNamespace<"dashboard">, type: string): string {
  switch (type) {
    case "bug_report":
      return t.feedbackTypeBugReport;
    case "feature_request":
      return t.feedbackTypeFeatureRequestOption;
    case "improvement":
      return t.feedbackTypeImprovement;
    case "other":
      return t.feedbackTypeOtherOption;
    default:
      return type;
  }
}

export function labelFeedbackStatus(t: ResolvedNamespace<"dashboard">, status: string): string {
  switch (status) {
    case "new":
      return t.feedbackStatusNew;
    case "planned":
      return t.feedbackStatusPlanned;
    case "in_progress":
      return t.feedbackStatusInProgress;
    case "delivered":
      return t.feedbackStatusDelivered;
    case "rejected":
      return t.feedbackStatusRejected;
    default:
      return status;
  }
}

export function labelFeedbackPriority(t: ResolvedNamespace<"dashboard">, priority: string): string {
  switch (priority) {
    case "high":
      return t.feedbackPriorityHigh;
    case "medium":
      return t.feedbackPriorityMedium;
    case "low":
      return t.feedbackPriorityLow;
    default:
      return priority;
  }
}
