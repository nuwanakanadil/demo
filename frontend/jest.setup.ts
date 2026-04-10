/// <reference types="jest" />

import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Fix TextEncoder
// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// Fix scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();