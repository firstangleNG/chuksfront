// lib/settings-service.ts

export class SettingsService {
  static getTermsAndConditions(): string[] {
    // In a real application, these would be fetched from a backend API or a configuration file.
    // For now, providing placeholder terms and conditions.
    return [
      "All repairs come with a 30-day warranty on parts and labor.",
      "Customer is responsible for backing up data before repair.",
      "RepairHub is not liable for data loss during repair process.",
      "Payment is due upon completion of repair unless otherwise arranged.",
      "Unclaimed devices after 90 days may be disposed of at our discretion.",
    ];
  }

  // Potentially add other settings methods here in the future
  // static getBusinessName(): string { return "RepairHub Solutions"; }
  // static getContactDetails(): string { return "123 Tech Lane, Innovation City, UK | Phone: +44 123 456 7890 | Email: info@repairhubsolutions.com"; }
}