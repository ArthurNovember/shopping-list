import React, { useCallback, useMemo, useState } from "react";
import { t } from "../i18n/strings";
import { useLang } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { API_BASE, fetchJSON } from "../lib/api";
import { StoreIcon } from "../components/icons/StoreIcon";
import {
  BackArrowIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GripIcon,
  HeartIcon,
  SearchIcon,
  StorefrontIcon,
} from "../components/icons/UiIcons";

/* =========================
   TYPES
========================= */
type ShopOption = {
  _id: string;
  name: string;
};

type FavoriteItem = {
  _id: string;
  text: string;
  shop: ShopOption[];
};

/* =========================
   CONSTS + STORAGE
========================= */
const BASE = API_BASE || "https://stressfreecheff-backend.onrender.com";
const TOKEN_KEY = "token";

async function getToken() {
  return (await AsyncStorage.getItem(TOKEN_KEY)) || "";
}

/* =========================
   HELPERS
========================= */
const isUnauthorizedError = (e: any) => {
  const msg = String(e?.message ?? e ?? "");
  return (
    /\b401\b/i.test(msg) ||
    /unauthor/i.test(msg) ||
    (/token/i.test(msg) && /invalid|expire|platn/i.test(msg))
  );
};

/* =========================
   SCREEN
========================= */
export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { lang } = useLang();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [shopOptions, setShopOptions] = useState<ShopOption[]>([]);

  const [newText, setNewText] = useState("");
  const [newFavoriteShopIds, setNewFavoriteShopIds] = useState<string[]>([]);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(
    null,
  );

  const [manageShopsVisible, setManageShopsVisible] = useState(false);
  const [addingShopName, setAddingShopName] = useState("");
  const [addingShopBusy, setAddingShopBusy] = useState(false);

  const [filterShopIds, setFilterShopIds] = useState<string[]>([]);

  /* =========================
   Effects
========================= */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(tabs)/shopping");
        return true;
      };

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => sub.remove();
    }, [router]),
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      const token = await getToken();

      const [favoritesRes, shopsRes] = await Promise.all([
        fetchJSON<FavoriteItem[]>(`${BASE}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchJSON<ShopOption[]>(`${BASE}/api/shopping-list/shop-options`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setFavorites(Array.isArray(favoritesRes) ? favoritesRes : []);
      setShopOptions(Array.isArray(shopsRes) ? shopsRes : []);
    } catch (e: any) {
      if (isUnauthorizedError(e)) setErr(t(lang, "shopping", "sessionExpired"));
      else setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  /* =========================
     HELPERS
  ========================= */
  const processedFavorites = useMemo(() => {
    let res = [...favorites];

    if (filterShopIds.length > 0) {
      res = res.filter((item) => {
        if (!item.shop || item.shop.length === 0) {
          return filterShopIds.includes("No Shop");
        }
        const ids = item.shop.map((s) => String(s._id));
        return filterShopIds.some((f) => ids.includes(f));
      });
    }

    return res.reverse();
  }, [favorites, filterShopIds]);

  const editingFavorite = useMemo(() => {
    if (!editingFavoriteId) return null;
    return favorites.find((f) => f._id === editingFavoriteId) || null;
  }, [editingFavoriteId, favorites]);

  const noShopActive = filterShopIds.includes("No Shop");

  const updateFavorite = useCallback(
    async (id: string, updates: { shop?: string[] }) => {
      try {
        const token = await getToken();
        const res = await fetch(`${BASE}/api/favorites/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        const updated: FavoriteItem[] = await res.json().catch(() => []);
        if (!res.ok)
          throw new Error((updated as any)?.error || `HTTP ${res.status}`);

        setFavorites(Array.isArray(updated) ? updated : []);
      } catch (e: any) {
        Alert.alert(
          t(lang, "shopping", "failedUpdateFavorites"),
          e?.message || String(e),
        );
      }
    },
    [lang],
  );

  const handleAddFavorite = useCallback(async () => {
    const trimmed = newText.trim();
    if (!trimmed) return;

    try {
      setSavingFavorite(true);
      const token = await getToken();
      if (!token) {
        Alert.alert(
          t(lang, "shopping", "loginRequiredFavoritesTitle"),
          t(lang, "shopping", "loginRequiredFavoritesMsg"),
        );
        return;
      }

      const res = await fetch(`${BASE}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: trimmed, shop: newFavoriteShopIds }),
      });

      const updated: FavoriteItem[] = await res.json().catch(() => []);
      if (!res.ok)
        throw new Error((updated as any)?.error || `HTTP ${res.status}`);

      setFavorites(Array.isArray(updated) ? updated : []);
      setNewText("");
      setNewFavoriteShopIds([]);
    } catch (e: any) {
      Alert.alert(
        t(lang, "shopping", "failedAddFavorite"),
        e?.message || String(e),
      );
    } finally {
      setSavingFavorite(false);
    }
  }, [lang, newText, newFavoriteShopIds]);

  const addToShoppingList = useCallback(
    async (fav: FavoriteItem) => {
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert(
            t(lang, "shopping", "loginRequiredFavoritesTitle"),
            t(lang, "shopping", "loginRequiredFavoritesMsg"),
          );
          return;
        }

        const shopIds = Array.isArray(fav.shop)
          ? fav.shop.map((s) => s._id).filter(Boolean)
          : [];

        const res = await fetch(`${BASE}/api/shopping-list`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: fav.text, shop: shopIds }),
        });

        const updatedList = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error((updatedList as any)?.error || `HTTP ${res.status}`);

        Alert.alert(
          t(lang, "favorites", "addedToShoppingTitle"),
          t(lang, "favorites", "addedToShoppingMsg"),
        );
      } catch (e: any) {
        Alert.alert(
          t(lang, "shopping", "failedAddItem"),
          e?.message || String(e),
        );
      }
    },
    [lang],
  );

  const deleteFavorite = useCallback(
    async (favoriteId: string) => {
      try {
        const token = await getToken();
        if (!token) {
          Alert.alert(
            t(lang, "shopping", "loginRequiredFavoritesTitle"),
            t(lang, "shopping", "loginRequiredFavoritesMsg"),
          );
          return;
        }

        const res = await fetch(`${BASE}/api/favorites/${favoriteId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const updated: FavoriteItem[] = await res.json().catch(() => []);
        if (!res.ok)
          throw new Error((updated as any)?.error || `HTTP ${res.status}`);

        setFavorites(Array.isArray(updated) ? updated : []);
      } catch (e: any) {
        Alert.alert(
          t(lang, "shopping", "failedUpdateFavorites"),
          e?.message || String(e),
        );
      }
    },
    [lang],
  );

  const toggleShopForFavorite = useCallback(
    async (fav: FavoriteItem, shopId: string) => {
      const currentIds = (fav.shop || []).map((s) =>
        typeof s === "string" ? s : s._id,
      );
      const has = currentIds.some((id) => String(id) === String(shopId));
      const nextIds = has
        ? currentIds.filter((id) => String(id) !== String(shopId))
        : [...currentIds, shopId];

      await updateFavorite(fav._id, { shop: nextIds });
    },
    [updateFavorite],
  );

  const handleAddShopOption = useCallback(async () => {
    const trimmed = addingShopName.trim();
    if (!trimmed) return;

    if (
      shopOptions.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      Alert.alert(t(lang, "shopping", "shopAlreadyExists"));
      return;
    }

    try {
      setAddingShopBusy(true);
      const token = await getToken();
      const res = await fetch(`${BASE}/api/shopping-list/shop-options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const newShop = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error((newShop as any)?.error || `HTTP ${res.status}`);

      setShopOptions((prev) => [...prev, newShop]);
      setAddingShopName("");
    } catch (e: any) {
      Alert.alert(
        t(lang, "shopping", "failedAddShop"),
        e?.message || String(e),
      );
    } finally {
      setAddingShopBusy(false);
    }
  }, [addingShopName, shopOptions, lang]);

  const deleteShopOption = useCallback(
    (shopToDeleteId: string) => {
      Alert.alert(
        t(lang, "shopping", "deleteShopTitle"),
        t(lang, "shopping", "deleteShopMsg"),
        [
          { text: t(lang, "shopping", "cancel"), style: "cancel" },
          {
            text: t(lang, "shopping", "delete"),
            style: "destructive",
            onPress: async () => {
              try {
                const token = await getToken();
                const res = await fetch(
                  `${BASE}/api/shopping-list/shop-options/${shopToDeleteId}`,
                  {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  },
                );

                if (!res.ok) {
                  const body = await res.text();
                  throw new Error(body || `HTTP ${res.status}`);
                }

                setShopOptions((prev) =>
                  prev.filter((s) => s._id !== shopToDeleteId),
                );

                // lokální cleanup (aby UI hned sedělo)
                setFavorites((prev) =>
                  prev.map((item) => ({
                    ...item,
                    shop: (item.shop || []).filter(
                      (s) => s._id !== shopToDeleteId,
                    ),
                  })),
                );
                setNewFavoriteShopIds((prev) =>
                  prev.filter((id) => id !== shopToDeleteId),
                );
              } catch (e: any) {
                Alert.alert("Failed to delete shop", e?.message || String(e));
              }
            },
          },
        ],
      );
    },
    [lang],
  );

  /* =========================
     LOADING / ERROR
  ========================= */
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={[styles.centerText, { color: colors.text }]}>
          {t(lang, "favorites", "loading")}
        </Text>
      </View>
    );
  }

  if (err) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.centerText, { color: colors.danger }]}>{err}</Text>

        <Pressable
          style={[
            styles.primaryBtn,
            { marginTop: 12, backgroundColor: colors.pillActive },
          ]}
          onPress={loadAll}
        >
          <Text style={styles.primaryBtnText}>
            {t(lang, "shopping", "retry")}
          </Text>
        </Pressable>
      </View>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Pressable
            hitSlop={8}
            style={styles.backBtn}
            onPress={() => router.replace("/(tabs)/shopping")}
          >
            <View
              style={[
                styles.backCircle,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <BackArrowIcon size={18} color={colors.text} />
            </View>
            <Text style={[styles.backText, { color: colors.text }]}>
              {t(lang, "favorites", "backToShopping").replace(/^[←\s]+/, "")}
            </Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 12 }}>
          <View
            style={[
              styles.newItemCard,
              { backgroundColor: colors.favorite, borderColor: colors.favoriteBorder },
            ]}
          >
            <View style={styles.cardDecoration} pointerEvents="none">
              <HeartIcon size={130} filled color={colors.pillActive} />
            </View>

            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t(lang, "favorites", "addFavoriteTitle")}
            </Text>

            <View
              style={[
                styles.searchRow,
                { backgroundColor: colors.card, borderColor: colors.favoriteBorder },
              ]}
            >
              <SearchIcon size={18} color={colors.muted} />
              <TextInput
                placeholder={t(lang, "favorites", "addFavoritePlaceholder")}
                placeholderTextColor={colors.muted}
                value={newText}
                onChangeText={setNewText}
                onSubmitEditing={handleAddFavorite}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>

            {shopOptions.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>
                  {t(lang, "shopping", "shopsForItem")}
                </Text>
                <View style={styles.storePillsRow}>
                  {shopOptions.map((shop) => {
                    const active = newFavoriteShopIds.includes(shop._id);
                    return (
                      <Pressable
                        key={shop._id}
                        style={[
                          styles.storePill,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                          active && {
                            backgroundColor: colors.pillActive,
                            borderColor: colors.pillActive,
                          },
                        ]}
                        onPress={() => {
                          setNewFavoriteShopIds((prev) =>
                            prev.includes(shop._id)
                              ? prev.filter((id) => id !== shop._id)
                              : [...prev, shop._id],
                          );
                        }}
                      >
                        <StoreIcon
                          name={shop.name}
                          size={16}
                          mono={active}
                          color="#fff"
                        />
                        <Text
                          style={[
                            styles.storePillText,
                            { color: colors.text },
                            active && styles.storePillTextActive,
                          ]}
                        >
                          {shop.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <Pressable
              style={[
                styles.manageCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setManageShopsVisible(true)}
            >
              <View
                style={[
                  styles.manageCardIcon,
                  { backgroundColor: colors.innerParts },
                ]}
              >
                <StorefrontIcon size={19} color={colors.pillActive} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.manageCardTitle, { color: colors.text }]}>
                  {shopOptions.length > 0
                    ? t(lang, "shopping", "manageShops")
                    : t(lang, "shopping", "addShops")}
                </Text>
                <Text
                  style={[styles.manageCardSubtitle, { color: colors.muted }]}
                >
                  {t(lang, "shopping", "manageShopsSubtitle")}
                </Text>
              </View>
              <ChevronRightIcon size={18} color={colors.muted} />
            </Pressable>

            <Pressable
              style={[
                styles.sendBtn,
                { backgroundColor: colors.pillActive },
                (!newText.trim() || savingFavorite) && { opacity: 0.6 },
              ]}
              onPress={handleAddFavorite}
              disabled={!newText.trim() || savingFavorite}
            >
              <HeartIcon size={18} color="#fff" />
              <Text style={styles.sendBtnText}>
                {savingFavorite
                  ? t(lang, "favorites", "saving")
                  : t(lang, "favorites", "addFavoriteBtn")}
              </Text>
            </Pressable>
          </View>

          <Text
            style={[
              styles.sectionLabel,
              { color: colors.heading, fontSize: 18, marginTop: 16 },
            ]}
          >
            {t(lang, "shopping", "filterByShop")}
          </Text>

          {shopOptions.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10, marginBottom: 4 }}
            >
              <Pressable
                onPress={() => setFilterShopIds([])}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  filterShopIds.length === 0 && {
                    backgroundColor: colors.pillActive,
                    borderColor: colors.pillActive,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: colors.text },
                    filterShopIds.length === 0 && styles.filterPillTextActive,
                  ]}
                >
                  {t(lang, "shopping", "all")}
                </Text>
                {filterShopIds.length === 0 && (
                  <CheckIcon size={12} color="#fff" />
                )}
              </Pressable>

              {shopOptions.map((shop) => {
                const active = filterShopIds.includes(shop._id);
                return (
                  <Pressable
                    key={shop._id}
                    onPress={() => {
                      setFilterShopIds((prev) =>
                        prev.includes(shop._id)
                          ? prev.filter((id) => id !== shop._id)
                          : [...prev, shop._id],
                      );
                    }}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      active && {
                        backgroundColor: colors.pillActive,
                        borderColor: colors.pillActive,
                      },
                    ]}
                  >
                    <StoreIcon
                      name={shop.name}
                      size={15}
                      mono={active}
                      color="#fff"
                    />
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: colors.text },
                        active && styles.filterPillTextActive,
                      ]}
                    >
                      {shop.name}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => {
                  setFilterShopIds((prev) =>
                    prev.includes("No Shop")
                      ? prev.filter((id) => id !== "No Shop")
                      : [...prev, "No Shop"],
                  );
                }}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  noShopActive && {
                    backgroundColor: colors.pillActive,
                    borderColor: colors.pillActive,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: colors.text },
                    noShopActive && styles.filterPillTextActive,
                  ]}
                >
                  {t(lang, "shopping", "noShop")}
                </Text>
              </Pressable>
            </ScrollView>
          )}
        </View>

        <View style={{ paddingHorizontal: 12, paddingTop: 4 }}>
          {processedFavorites.length === 0 ? (
            <View style={styles.emptyState} />
          ) : (
            processedFavorites.map((item, index) => {
              const hasShop = !!item.shop && item.shop.length > 0;
              const shopLabel = hasShop
                ? item.shop.map((s) => s.name).join(", ")
                : t(lang, "shopping", "shopsTitle");

              return (
                <View
                  key={item._id}
                  style={[
                    styles.row,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[styles.accentBar, { backgroundColor: colors.pillActive }]}
                  />

                  <View style={styles.rowContent}>
                    <View style={styles.gripHandle}>
                      <GripIcon size={16} color={colors.muted} />
                    </View>

                    <View
                      style={[
                        styles.itemIconCircle,
                        { backgroundColor: colors.innerParts },
                      ]}
                    >
                      <StoreIcon
                        name={hasShop ? item.shop[0].name : ""}
                        size={20}
                        mono
                        color={colors.pillActive}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemText, { color: colors.text }]}>
                        <Text
                          style={[styles.itemIndex, { color: colors.pillActive }]}
                        >
                          {index + 1}.{" "}
                        </Text>
                        {item.text}
                      </Text>

                      <Pressable
                        style={[
                          styles.shopsBtn,
                          {
                            backgroundColor: colors.shop,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setEditingFavoriteId(item._id)}
                      >
                        {hasShop && (
                          <StoreIcon
                            name={item.shop[0].name}
                            size={13}
                            mono
                            color={colors.secondaryText}
                          />
                        )}
                        <Text
                          style={[
                            styles.shopsBtnText,
                            { color: colors.secondaryText },
                          ]}
                        >
                          {shopLabel}
                        </Text>
                        <ChevronDownIcon size={11} color={colors.secondaryText} />
                      </Pressable>
                    </View>

                    <View style={styles.rowButtons}>
                      <Pressable
                        onPress={() => addToShoppingList(item)}
                        style={[
                          styles.smallBtn,
                          { backgroundColor: colors.card, borderColor: colors.border },
                        ]}
                      >
                        <MaterialIcons
                          name="add-shopping-cart"
                          size={18}
                          color={colors.text}
                        />
                      </Pressable>

                      <Pressable
                        style={[styles.smallBtn, { backgroundColor: colors.pillActive }]}
                        onPress={() => deleteFavorite(item._id)}
                      >
                        <Text style={styles.smallBtnText}>✕</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={!!editingFavorite}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingFavoriteId(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingFavorite?.text || t(lang, "shopping", "itemFallback")}
              </Text>

              <Text
                style={[styles.modalSubtitle, { color: colors.secondaryText }]}
              >
                {t(lang, "shopping", "shopsTitle")}
              </Text>

              <ScrollView style={{ maxHeight: 260, marginTop: 8 }}>
                {shopOptions.map((shop) => {
                  const itemShopIds =
                    editingFavorite?.shop?.map((s) => String(s._id)) || [];
                  const active = itemShopIds.includes(shop._id);

                  return (
                    <View
                      key={shop._id}
                      style={[styles.modalRow, { borderBottomColor: colors.border }]}
                    >
                      <Pressable
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                        onPress={() =>
                          editingFavorite &&
                          toggleShopForFavorite(editingFavorite, shop._id)
                        }
                      >
                        <Text style={[styles.modalRowText, { color: colors.text }]}>
                          {shop.name}
                        </Text>

                        {active && (
                          <Text style={[styles.modalRowText, { color: colors.text }]}>
                            ✓
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={{ marginTop: 12 }}>
                <Text style={[styles.label, { color: colors.muted }]}>
                  {t(lang, "shopping", "addNewShopLabel")}
                </Text>

                <View style={styles.addShopRow}>
                  <TextInput
                    value={addingShopName}
                    onChangeText={setAddingShopName}
                    placeholder={t(lang, "shopping", "newShopPlaceholder")}
                    placeholderTextColor={colors.muted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        marginBottom: 0,
                        backgroundColor: colors.innerParts,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                  />

                  <Pressable
                    style={[
                      styles.primaryBtn,
                      {
                        marginLeft: 8,
                        marginTop: 0,
                        paddingHorizontal: 16,
                        backgroundColor: colors.pillActive,
                      },
                    ]}
                    disabled={addingShopBusy}
                    onPress={handleAddShopOption}
                  >
                    <Text style={styles.primaryBtnText}>
                      {addingShopBusy ? "…" : "+"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[
                  styles.secondaryBtn,
                  {
                    marginTop: 16,
                    backgroundColor: colors.innerParts,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setEditingFavoriteId(null)}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                  {t(lang, "shopping", "close")}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={manageShopsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setManageShopsVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t(lang, "shopping", "manageShopsTitle")}
              </Text>

              <ScrollView style={{ maxHeight: 260, marginTop: 8 }}>
                {shopOptions.map((shop) => (
                  <View
                    key={shop._id}
                    style={[styles.modalRow, { borderBottomColor: colors.border }]}
                  >
                    <Text style={[styles.modalRowText, { color: colors.text }]}>
                      {shop.name}
                    </Text>

                    <Pressable
                      style={styles.modalDeleteShopBtn}
                      onPress={() => deleteShopOption(shop._id)}
                    >
                      <Text style={styles.modalDeleteShopText}>❌</Text>
                    </Pressable>
                  </View>
                ))}

                {shopOptions.length === 0 && (
                  <Text style={{ color: colors.muted, marginTop: 4 }}>
                    {t(lang, "shopping", "noShopsYet")}
                  </Text>
                )}
              </ScrollView>

              <View style={{ marginTop: 12 }}>
                <Text style={[styles.label, { color: colors.muted }]}>
                  {t(lang, "shopping", "addNewShopLabel")}
                </Text>

                <View style={styles.addShopRow}>
                  <TextInput
                    value={addingShopName}
                    onChangeText={setAddingShopName}
                    placeholder={t(lang, "shopping", "newShopPlaceholder")}
                    placeholderTextColor={colors.muted}
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        marginBottom: 0,
                        backgroundColor: colors.innerParts,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                  />
                  <Pressable
                    style={[
                      styles.primaryBtn,
                      {
                        marginLeft: 8,
                        marginTop: 0,
                        paddingHorizontal: 16,
                        backgroundColor: colors.pillActive,
                      },
                    ]}
                    disabled={addingShopBusy}
                    onPress={handleAddShopOption}
                  >
                    <Text style={styles.primaryBtnText}>
                      {addingShopBusy ? "…" : "+"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[
                  styles.secondaryBtn,
                  {
                    marginTop: 16,
                    backgroundColor: colors.innerParts,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setManageShopsVisible(false)}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                  {t(lang, "shopping", "close")}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 20 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  centerText: { textAlign: "center" },

  headerRow: { paddingHorizontal: 12, paddingBottom: 10 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 10 },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 15, fontWeight: "600" },

  newItemCard: {
    marginTop: 4,
    marginBottom: 4,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },

  cardDecoration: {
    position: "absolute",
    top: -30,
    right: -30,
    opacity: 0.14,
    transform: [{ rotate: "-12deg" }],
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 14,
    maxWidth: "78%",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    lineHeight: 26,
    fontFamily: "MetropolisBold",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  storePillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  storePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  storePillText: { fontSize: 13, fontWeight: "600" },
  storePillTextActive: { color: "#fff" },

  manageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  manageCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  manageCardTitle: { fontSize: 15, fontWeight: "700" },
  manageCardSubtitle: { fontSize: 12, marginTop: 2 },

  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  sendBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: { fontSize: 13, fontWeight: "600" },
  filterPillTextActive: { color: "#fff" },

  emptyState: { minHeight: 120 },

  row: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  accentBar: { width: 4 },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  gripHandle: { paddingHorizontal: 4, marginRight: 6 },

  itemIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  itemText: { fontSize: 18, marginBottom: 6 },
  itemIndex: { fontWeight: "800" },

  shopsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  shopsBtnText: { fontSize: 11 },

  rowButtons: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { color: "#ffffff", fontWeight: "800", fontSize: 14 },

  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  secondaryBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtnText: { fontWeight: "700" },

  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  label: { fontSize: 12, marginBottom: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: { borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalSubtitle: { marginTop: 8, fontWeight: "700" },

  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalRowText: {},

  addShopRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },

  modalDeleteShopBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  modalDeleteShopText: { color: "#fff", fontWeight: "700" },
});
