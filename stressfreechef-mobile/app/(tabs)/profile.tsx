import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import { MaterialIcons } from "@expo/vector-icons";

import { t, Lang, LANG_KEY } from "../../i18n/strings";
import { API_BASE, fetchJSON } from "../../lib/api";
import { useTheme } from "../../theme/ThemeContext";

import { useLang } from "../../i18n/LanguageContext";

/* =========================
   CONSTS + STORAGE
========================= */

/* =========================
   HELPERS 
========================= */
function pickCancelText(lang: "en" | "cs") {
  return lang === "cs" ? "Zrušit" : "Cancel";
}

function pickDeleteText(lang: "en" | "cs") {
  return lang === "cs" ? "Smazat" : "Delete";
}

/* =========================
   TYPES
========================= */

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

type PagedResponse<T> = {
  items?: T[];
  page?: number;
  pages?: number;
};

type Cover = { url: string; isVideo: boolean };

type RecipeLike = any;

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/* =========================
   CONSTS
========================= */

const BASE = API_BASE || "https://stressfreecheff-backend.onrender.com";
const TOKEN_KEY = "token";

const SAVED_LIMIT = 8;
const MY_LIMIT = 12;

/* =========================
   HELPERS 
========================= */

function isVideoUrl(url = "") {
  return /(\.mp4|\.webm|\.mov|\.m4v)(\?|#|$)/i.test(url);
}

function getCover(r: any): Cover {
  const url =
    r?.image?.url ||
    r?.imgSrc ||
    (r?.steps || []).find((s: any) => s?.type === "image" && s?.src)?.src ||
    (r?.steps || []).find((s: any) => s?.src)?.src ||
    "https://i.imgur.com/CZaFjz2.png";
  return { url, isVideo: isVideoUrl(url) };
}

function translateDifficulty(lang: Lang, diff: string) {
  if (lang === "cs") {
    if (diff === "Beginner") return "Začátečník";
    if (diff === "Intermediate") return "Pokročilý";
    if (diff === "Hard") return "Expert";
  }
  return diff;
}

function isUnauthorizedError(e: any) {
  const msg = String(e?.message ?? e ?? "");
  return (
    /\b401\b/i.test(msg) ||
    /unauthor/i.test(msg) ||
    (/token/i.test(msg) && /invalid|expire|platn/i.test(msg))
  );
}

/* =========================
  API
========================= */

async function getToken() {
  return (await AsyncStorage.getItem(TOKEN_KEY)) || "";
}
async function setToken(tkn: string) {
  await AsyncStorage.setItem(TOKEN_KEY, tkn);
}
async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
async function loadLang(): Promise<Lang> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    return stored === "cs" || stored === "en" ? stored : "en";
  } catch {
    return "en";
  }
}

async function fetchMe(token: string): Promise<ActionResult<any>> {
  try {
    const me = await fetchJSON(`${BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: true, data: me || null };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

async function fetchMyRecipesPage(
  token: string,
  page: number,
): Promise<ActionResult<PagedResponse<RecipeLike>>> {
  try {
    const res = await fetchJSON<PagedResponse<RecipeLike>>(
      `${BASE}/api/my-recipes?page=${page}&limit=${MY_LIMIT}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      ok: true,
      data: {
        items: Array.isArray(res?.items) ? res.items : [],
        page: Number(res?.page) || page,
        pages: Number(res?.pages) || 1,
      },
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

async function fetchSavedRecipesPage(
  token: string,
  page: number,
): Promise<ActionResult<PagedResponse<RecipeLike>>> {
  try {
    const res = await fetchJSON<PagedResponse<RecipeLike>>(
      `${BASE}/api/saved-community-recipes?page=${page}&limit=${SAVED_LIMIT}&sort=newest`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      ok: true,
      data: {
        items: Array.isArray(res?.items) ? res.items : [],
        page,
        pages: Number(res?.pages) || 1,
      },
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/* =========================
   UI: Rating
========================= */

function StarRatingDisplay({
  value,
  size = 16,
  count,
  textColor,
}: {
  value: number;
  size?: number;
  count?: number;
  textColor?: string;
}) {
  const val = Math.max(0, Math.min(5, value || 0));

  return (
    <View style={styles.ratingRow}>
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: 5 }, (_, i) => {
          const diff = val - i;

          let icon: MaterialIconName = "star-border";
          if (diff >= 0.75) icon = "star";
          else if (diff >= 0.25) icon = "star-half";

          return (
            <MaterialIcons
              key={i}
              name={icon}
              size={size}
              color="#ffd54f"
              style={{ marginRight: 1 }}
            />
          );
        })}
      </View>

      {typeof count === "number" ? (
        <Text
          style={{
            color: textColor || "#dcd7d7ff",
            fontSize: 12,
            opacity: 0.8,
          }}
        >
          {val.toFixed(1)} ({count})
        </Text>
      ) : null}
    </View>
  );
}

/* =========================
   AUTH FORM
========================= */

function AuthFormRN({
  onLoggedIn,
  lang,
}: {
  onLoggedIn: () => void;
  lang: Lang;
}) {
  const { colors } = useTheme();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignup() {
    if (password !== confirm) {
      Alert.alert(t(lang, "profile", "passwordsDontMatch"));
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`${BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok)
        throw new Error(String(data?.error || "Registration error."));

      Alert.alert(
        t(lang, "profile", "registrationSuccessfulTitle"),
        t(lang, "profile", "registrationSuccessfulMsg"),
      );

      setMode("login");
    } catch (e: any) {
      Alert.alert(
        t(lang, "profile", "registrationFailedTitle"),
        e?.message || String(e),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin() {
    try {
      setBusy(true);

      const res = await fetch(`${BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token)
        throw new Error(String(data?.error || "Login error."));

      await setToken(String(data.token));
      Alert.alert(t(lang, "profile", "loginSuccessfulTitle"));

      onLoggedIn();
    } catch (e: any) {
      Alert.alert(
        t(lang, "profile", "loginFailedTitle"),
        e?.message || String(e),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.authWrap,
        { backgroundColor: colors.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.authSwitchRow}>
        <Pressable
          onPress={() => setMode("signup")}
          style={[
            styles.switchBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            mode === "signup" && {
              backgroundColor: colors.pillActive,
              borderColor: colors.pillActive,
            },
          ]}
        >
          <Text style={[styles.switchText, { color: colors.text }]}>
            {t(lang, "profile", "authSignUp")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("login")}
          style={[
            styles.switchBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
            mode === "login" && {
              backgroundColor: colors.pillActive,
              borderColor: colors.pillActive,
            },
          ]}
        >
          <Text style={[styles.switchText, { color: colors.text }]}>
            {t(lang, "profile", "authLogin")}
          </Text>
        </Pressable>
      </View>

      {mode === "signup" ? (
        <View style={styles.form} key="signup">
          <Text style={[styles.label, { color: colors.text }]}>
            {t(lang, "profile", "username")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { color: colors.text }]}>
            {t(lang, "profile", "password")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={[styles.label, { color: colors.text }]}>
            {t(lang, "profile", "confirmPassword")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <Pressable
            disabled={busy}
            onPress={handleSignup}
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.pillActive },
              busy && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: "white" }]}>
              {busy
                ? t(lang, "profile", "pleaseWait")
                : t(lang, "profile", "authSignUp")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form} key="login">
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            importantForAutofill="yes"
            autoComplete="username"
          />

          <Text style={[styles.label, { color: colors.text }]}>
            {t(lang, "profile", "password")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            importantForAutofill="yes"
            autoComplete="password"
          />

          <Pressable
            disabled={busy}
            onPress={handleLogin}
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.pillActive },
              busy && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: "white" }]}>
              {busy
                ? t(lang, "profile", "pleaseWait")
                : t(lang, "profile", "authLogin")}
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

/* =========================
   PROFILE 
========================= */

function MyProfileRN({ onLoggedOut }: { onLoggedOut: () => void; lang: Lang }) {
  const [user, setUser] = useState<any>(null);
  const [selected, setSelected] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const { theme, setTheme, colors } = useTheme();
  const { lang, setLang } = useLang();

  const [deleting, setDeleting] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  /* =========================
     EFFECTS
  ========================= */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);

        if (cancelled) return;

        setHasToken(!!token);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================
     HELPERS
  ========================= */
  const handleThemeChange = useCallback(
    async (next: "light" | "dark") => {
      await setTheme(next);
    },
    [setTheme],
  );

  const handleLangChange = useCallback(
    async (next: "en" | "cs") => {
      await setLang(next);
    },
    [setLang],
  );

  const actuallyDeleteProfile = useCallback(async () => {
    try {
      setDeleting(true);

      const token = await getToken();
      if (!token) {
        Alert.alert(
          t(lang, "settings", "notLoggedInTitle"),
          t(lang, "settings", "notLoggedInMsg"),
        );
        return;
      }

      const res = await fetch(`${API_BASE}/api/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
      }

      await clearToken();
      setHasToken(false);

      Alert.alert(
        t(lang, "settings", "deletedTitle"),
        t(lang, "settings", "deletedMsg"),
      );

      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert(
        t(lang, "settings", "deleteFailedTitle"),
        e?.message || String(e),
      );
    } finally {
      setDeleting(false);
    }
  }, [lang]);

  const confirmDeleteProfile = useCallback(() => {
    Alert.alert(
      t(lang, "settings", "confirmDeleteTitle"),
      t(lang, "settings", "confirmDeleteMessage"),
      [
        { text: pickCancelText(lang), style: "cancel" },
        {
          text: pickDeleteText(lang),
          style: "destructive",
          onPress: actuallyDeleteProfile,
        },
      ],
    );
  }, [lang, actuallyDeleteProfile]);

  const selectedCover = useMemo(
    () => (selected ? getCover(selected) : null),
    [selected],
  );

  const logout = useCallback(async () => {
    await clearToken();
    onLoggedOut();
  }, [onLoggedOut]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Missing token");

      const meRes = await fetchMe(token);
      if (meRes.ok) setUser(meRes.data);
      else setUser(null);

      const [savedRes, myRes] = await Promise.all([
        fetchSavedRecipesPage(token, 1),
        fetchMyRecipesPage(token, 1),
      ]);

      if (!savedRes.ok) throw new Error(savedRes.error);
      if (!myRes.ok) throw new Error(myRes.error);
    } catch (e: any) {
      if (isUnauthorizedError(e)) {
        await clearToken();
        onLoggedOut();
        return;
      }
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [onLoggedOut]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: colors.text }}>
          {t(lang, "profile", "loading")}
        </Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.err, { color: colors.danger }]}>
          {t(lang, "profile", "errorPrefix")}: {err}
        </Text>

        <Pressable
          onPress={loadAll}
          style={[
            styles.primaryBtn,
            { marginTop: 12, backgroundColor: colors.pillActive },
          ]}
        >
          <Text style={[styles.primaryBtnText, { color: colors.text }]}>
            {t(lang, "profile", "retry")}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.profileHeader}>
        <View style={{ flex: 1 }} />

        <View style={{ flexDirection: "row", gap: 8 }}>
          <View
            style={[styles.container, { backgroundColor: colors.background }]}
          >
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <MaterialIcons
                  name="arrow-back"
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.secondaryText ?? colors.text },
                ]}
              >
                {t(lang, "settings", "themeTitle")}
              </Text>

              <View style={styles.row}>
                <Pressable
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    theme === "dark" && {
                      backgroundColor: colors.pillActive,
                      borderColor: colors.pillActive,
                    },
                  ]}
                  onPress={() => handleThemeChange("dark")}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: colors.text },
                      theme === "dark" && styles.pillTextActive,
                    ]}
                  >
                    {t(lang, "settings", "themeDark")}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    theme === "light" && {
                      backgroundColor: colors.pillActive,
                      borderColor: colors.pillActive,
                    },
                  ]}
                  onPress={() => handleThemeChange("light")}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: colors.text },
                      theme === "light" && styles.pillTextActive,
                    ]}
                  >
                    {t(lang, "settings", "themeLight")}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.secondaryText ?? colors.text },
                ]}
              >
                {t(lang, "settings", "langTitle")}
              </Text>

              <View style={styles.row}>
                <Pressable
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    lang === "en" && {
                      backgroundColor: colors.pillActive,
                      borderColor: colors.pillActive,
                    },
                  ]}
                  onPress={() => handleLangChange("en")}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: colors.text },
                      lang === "en" && styles.pillTextActive,
                    ]}
                  >
                    English
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    lang === "cs" && {
                      backgroundColor: colors.pillActive,
                      borderColor: colors.pillActive,
                    },
                  ]}
                  onPress={() => handleLangChange("cs")}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: colors.text },
                      lang === "cs" && styles.pillTextActive,
                    ]}
                  >
                    Čeština
                  </Text>
                </Pressable>
              </View>
            </View>

            {hasToken && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.secondaryText ?? colors.text },
                  ]}
                >
                  {t(lang, "settings", "dangerTitle")}
                </Text>

                <Pressable
                  style={[
                    styles.deleteBtn,
                    {
                      backgroundColor: "#962626ff",
                      opacity: deleting ? 0.7 : 1,
                    },
                  ]}
                  onPress={confirmDeleteProfile}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator />
                  ) : (
                    <>
                      <MaterialIcons
                        name="delete-forever"
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.deleteBtnText}>
                        {t(lang, "settings", "deleteBtn")}
                      </Text>
                    </>
                  )}
                </Pressable>

                <Text style={[styles.helper, { color: colors.muted }]}>
                  {t(lang, "settings", "dangerHelper")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={{ display: "flex", alignItems: "center" }}>
        <Pressable
          onPress={logout}
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              marginTop: 30,
              width: "90%",
            },
          ]}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
            {t(lang, "profile", "logout")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================
   ROOT
========================= */

export default function ProfileScreen() {
  const { colors } = useTheme();

  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [lang, setLang] = useState<Lang>("en");

  const refreshAuth = useCallback(async () => {
    const tkn = await getToken();
    setHasToken(Boolean(tkn));
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    (async () => setLang(await loadLang()))();
  }, []);

  if (hasToken === null) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return hasToken ? (
    <MyProfileRN onLoggedOut={refreshAuth} lang={lang} />
  ) : (
    <AuthFormRN onLoggedIn={refreshAuth} lang={lang} />
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f0fff",
  },
  err: { fontWeight: "700", textAlign: "center" },

  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  authWrap: { gap: 16, flexGrow: 1, paddingBottom: 24 },
  authSwitchRow: { flexDirection: "row", paddingTop: 35 },
  switchBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
  },
  switchText: { fontWeight: "700" },
  form: { gap: 8, marginTop: 12, paddingHorizontal: 12 },
  label: { opacity: 0.9 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },

  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  primaryBtnText: { fontWeight: "700" },
  secondaryBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 10,
  },
  secondaryBtnText: { fontWeight: "700" },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  metaText: { fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },

  card: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 6,
    overflow: "hidden",
    height: 100,
    alignItems: "center",
  },
  cardImg: { width: 96, height: 96, backgroundColor: "#333" },
  cardTitle: { fontWeight: "800", fontSize: 14 },

  iconBtn: {
    width: 40,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalCard: {
    borderRadius: 16,
    padding: 12,
    elevation: 4,
  },
  modalImg: {
    width: "100%",
    aspectRatio: 1.4,
    borderRadius: 12,
    backgroundColor: "#333",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", marginTop: 10 },

  section: { marginTop: 12, marginBottom: 4, fontWeight: "700" },

  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  ingredient: {
    fontSize: 14,
    opacity: 0.9,
    marginVertical: 2,
    flex: 1,
    flexWrap: "wrap",
    marginRight: 8,
  },
  ingredientAddBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  helper: {
    marginTop: 6,
    fontSize: 12,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  deleteBtnText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
