import { Party } from '../types';

export interface SeatDistributionResult {
  partyId: string;
  partyName: string;
  shortName: string;
  percentage: number;
  seats: number;
  seatPercentage: number;
  passedThreshold: boolean;
  color: string;
}

export function calculateDumaSeats(
  parties: Party[],
  totalSeats: number = 450,
  proportionalSeatsOnly: boolean = false
): {
  results: SeatDistributionResult[];
  qualifyingPartiesCount: number;
  totalAllocatedSeats: number;
  majorityParty: SeatDistributionResult | null;
  hasConstitutionalMajority: boolean;
  hasSimpleMajority: boolean;
} {
  const seatsToDistribute = proportionalSeatsOnly ? 225 : totalSeats;
  const threshold = 5.0;

  // Filter parties that meet the 5% threshold
  const qualifyingParties = parties.filter((p) => p.percentage >= threshold);
  const totalQualifyingPct = qualifyingParties.reduce((sum, p) => sum + p.percentage, 0);

  const initialResults: Map<string, { seats: number; remainder: number }> = new Map();

  let distributedCount = 0;

  if (totalQualifyingPct > 0) {
    const quota = totalQualifyingPct / seatsToDistribute;

    // First round: integer quotients
    qualifyingParties.forEach((p) => {
      const exactSeats = p.percentage / quota;
      const integerSeats = Math.floor(exactSeats);
      const remainder = exactSeats - integerSeats;
      initialResults.set(p.id, { seats: integerSeats, remainder });
      distributedCount += integerSeats;
    });

    // Second round: largest remainders (Hare-Niemeyer method)
    let seatsRemaining = seatsToDistribute - distributedCount;
    const sortedByRemainder = [...qualifyingParties].sort((a, b) => {
      const remA = initialResults.get(a.id)?.remainder || 0;
      const remB = initialResults.get(b.id)?.remainder || 0;
      return remB - remA;
    });

    let index = 0;
    while (seatsRemaining > 0 && index < sortedByRemainder.length) {
      const party = sortedByRemainder[index];
      const current = initialResults.get(party.id)!;
      initialResults.set(party.id, { ...current, seats: current.seats + 1 });
      seatsRemaining--;
      index = (index + 1) % sortedByRemainder.length;
    }
  }

  const results: SeatDistributionResult[] = parties.map((p) => {
    const passed = p.percentage >= threshold;
    const seats = passed && initialResults.has(p.id) ? initialResults.get(p.id)!.seats : 0;
    const seatPercentage = seatsToDistribute > 0 ? (seats / seatsToDistribute) * 100 : 0;

    return {
      partyId: p.id,
      partyName: p.name,
      shortName: p.shortName,
      percentage: p.percentage,
      seats,
      seatPercentage,
      passedThreshold: passed,
      color: p.color,
    };
  });

  // Calculate majority
  const sortedBySeats = [...results].sort((a, b) => b.seats - a.seats);
  const majorityParty = sortedBySeats.length > 0 && sortedBySeats[0].seats > 0 ? sortedBySeats[0] : null;

  const simpleMajorityThreshold = Math.floor(seatsToDistribute / 2) + 1; // 226 for 450
  const constitutionalMajorityThreshold = Math.ceil((seatsToDistribute * 2) / 3); // 300 for 450

  const hasSimpleMajority = majorityParty ? majorityParty.seats >= simpleMajorityThreshold : false;
  const hasConstitutionalMajority = majorityParty
    ? majorityParty.seats >= constitutionalMajorityThreshold
    : false;

  const totalAllocatedSeats = results.reduce((acc, r) => acc + r.seats, 0);

  return {
    results,
    qualifyingPartiesCount: qualifyingParties.length,
    totalAllocatedSeats,
    majorityParty,
    hasConstitutionalMajority,
    hasSimpleMajority,
  };
}
