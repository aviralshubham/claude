import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
  jwtVerify: vi.fn(),
}));

const mockPayload = {
  userId: "user-1",
  email: "test@example.com",
  expiresAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(jwtVerify).mockResolvedValue({ payload: mockPayload } as any);
  mockCookieStore.get.mockReturnValue({ value: "mock-jwt-token" });
});

// ─── createSession ────────────────────────────────────────────────────────────

test("createSession sets cookie with the signed token", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");
  expect(mockCookieStore.set).toHaveBeenCalledWith(
    "auth-token",
    "mock-jwt-token",
    expect.any(Object)
  );
});

test("createSession sets httpOnly cookie", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");
  const options = mockCookieStore.set.mock.calls[0][2];
  expect(options.httpOnly).toBe(true);
});

test("createSession sets secure: false in non-production", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");
  const options = mockCookieStore.set.mock.calls[0][2];
  expect(options.secure).toBe(false);
});

test("createSession sets sameSite: lax", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");
  const options = mockCookieStore.set.mock.calls[0][2];
  expect(options.sameSite).toBe("lax");
});

test("createSession sets expires ~7 days from now", async () => {
  const before = Date.now();
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");
  const after = Date.now();
  const options = mockCookieStore.set.mock.calls[0][2];
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  expect(options.expires).toBeInstanceOf(Date);
  expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

// ─── getSession ───────────────────────────────────────────────────────────────

test("getSession returns SessionPayload when token is valid", async () => {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  expect(session).toEqual(mockPayload);
});

test("getSession returns null when cookie is absent", async () => {
  mockCookieStore.get.mockReturnValue(undefined);
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  expect(session).toBeNull();
});

test("getSession returns null when jwtVerify throws", async () => {
  vi.mocked(jwtVerify).mockRejectedValue(new Error("invalid signature"));
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  expect(session).toBeNull();
});

// ─── deleteSession ────────────────────────────────────────────────────────────

test("deleteSession deletes the auth-token cookie", async () => {
  const { deleteSession } = await import("@/lib/auth");
  await deleteSession();
  expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
});

// ─── verifySession ────────────────────────────────────────────────────────────

function makeRequest(token: string | undefined) {
  return {
    cookies: { get: (_name: string) => (token ? { value: token } : undefined) },
  } as any;
}

test("verifySession returns SessionPayload when token is valid", async () => {
  const { verifySession } = await import("@/lib/auth");
  const session = await verifySession(makeRequest("mock-jwt-token"));
  expect(session).toEqual(mockPayload);
});

test("verifySession returns null when cookie is absent from request", async () => {
  const { verifySession } = await import("@/lib/auth");
  const session = await verifySession(makeRequest(undefined));
  expect(session).toBeNull();
});

test("verifySession returns null when jwtVerify throws", async () => {
  vi.mocked(jwtVerify).mockRejectedValue(new Error("expired"));
  const { verifySession } = await import("@/lib/auth");
  const session = await verifySession(makeRequest("bad-token"));
  expect(session).toBeNull();
});
