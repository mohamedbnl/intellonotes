import { describe, it, expect } from "vitest";
import { calculateCommission } from "../commission";

describe("calculateCommission", () => {
  it("splits 56 Dh correctly (70/30)", () => {
    const result = calculateCommission(56);
    expect(result.professorCommission).toBe(39.2);
    expect(result.platformCommission).toBe(16.8);
  });

  it("splits 49 Dh correctly", () => {
    const result = calculateCommission(49);
    expect(result.professorCommission).toBe(34.3);
    expect(result.platformCommission).toBe(14.7);
  });

  it("splits 78 Dh correctly", () => {
    const result = calculateCommission(78);
    expect(result.professorCommission).toBe(54.6);
    expect(result.platformCommission).toBe(23.4);
  });

  it("professor + platform sums to original amount", () => {
    const prices = [49, 56, 68, 78];
    prices.forEach((price) => {
      const { professorCommission, platformCommission } = calculateCommission(price);
      expect(
        Math.round((professorCommission + platformCommission) * 100) / 100
      ).toBe(price);
    });
  });

  it("handles zero amount", () => {
    const result = calculateCommission(0);
    expect(result.professorCommission).toBe(0);
    expect(result.platformCommission).toBe(0);
  });

  it("professor always gets 70%", () => {
    const result = calculateCommission(100);
    expect(result.professorCommission).toBe(70);
    expect(result.platformCommission).toBe(30);
  });
});
