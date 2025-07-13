export const log_audit_event = (userId: string, eventType: string, details: object) => {
  console.log(`Audit Event: User ${userId}, Type: ${eventType}, Details: ${JSON.stringify(details)}`);
  // In a real application, this would log to a persistent store like a database or a dedicated logging service.
};