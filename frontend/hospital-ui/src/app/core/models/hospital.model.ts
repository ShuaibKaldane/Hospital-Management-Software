/**
 * Hospital record for the patient sign-up screen.
 *
 * Populated locally from the marketing-site checkout:
 * when a hospital buys a plan, a record is added under
 * the `medicare_hospitals` key in localStorage on the
 * same browser. This service reads from there so patients
 * can pick the hospital they want to register with.
 *
 * Shape mirrors what `marketing-site/assets/js/script.js`
 * writes to localStorage.
 */
export interface HospitalOption {
  id: string;
  hospitalName: string;
  hospitalSlug?: string;
  city?: string;
  state?: string;
  planName?: string;
  transactionId?: string;
}

export interface HospitalListMessage {
  type: 'medicare:hospitals-updated';
  hospitals: HospitalOption[];
}
