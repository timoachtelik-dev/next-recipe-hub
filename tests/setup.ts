import "@testing-library/jest-dom";
import { expect } from "vitest";

// Make expect available globally
declare global {
  var expect: typeof import("vitest").expect;
}

global.expect = expect;
