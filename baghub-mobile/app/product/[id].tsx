import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Variant = {
  id: string;
  colorName: string;
  colorCode?: string | null;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  variants: Variant[];
};

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const fetchProductDetails = () => {
    setLoading(true);
    setError(null);
    fetch(`http://172.26.2.112:3000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Product not found");
        }
        return res.json();
      })
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
        } else if (data) {
          setProduct(data);
        } else {
          throw new Error("Invalid product response structure");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        setError("Could not retrieve product details. Please try again.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={styles.loadingText}>Loading bag details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error || "Failed to load product details"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get active variant image or fallback to a gorgeous high-quality bag placeholder
  const activeImageUrl = product.variants?.[selectedVariantIndex]?.imageUrl 
    || product.variants?.[0]?.imageUrl
    || "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=600&auto=format&fit=crop";

  const fallbackDescription = 
    product.description && product.description.trim() !== ""
      ? product.description
      : "Elevate your style with this iconic premium collection. Crafted from high-grade water-resistant materials, it offers unmatched durability paired with an exceptionally elegant modern silhouette. Designed carefully with multiple secure compartments, a premium soft-touch interior lining, and heavy-duty custom metallic hardware, it is perfect for both daily use and special occasions.";

  const handleAddToCart = () => {
    Alert.alert("Success", `${product.name} added to cart!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Absolute Overlays */}
      <TouchableOpacity 
        style={styles.floatingBackButton} 
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={24} color="#1F2937" />
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Large Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: activeImageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Content Section */}
        <View style={styles.detailsContainer}>
          {/* Header Info */}
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>Rs. {product.price.toLocaleString()}</Text>

          {/* Color/Variant Selection (Premium touch) */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Available Colors</Text>
              <View style={styles.variantsRow}>
                {product.variants.map((v, index) => {
                  const isSelected = index === selectedVariantIndex;
                  return (
                    <TouchableOpacity
                      key={v.id || index}
                      onPress={() => setSelectedVariantIndex(index)}
                      style={[
                        styles.variantBadge,
                        isSelected && styles.variantBadgeSelected
                      ]}
                    >
                      {v.colorCode ? (
                        <View 
                          style={[
                            styles.colorDot, 
                            { backgroundColor: v.colorCode }
                          ]} 
                        />
                      ) : null}
                      <Text style={[
                        styles.variantText,
                        isSelected && styles.variantTextSelected
                      ]}>
                        {v.colorName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.descriptionText}>
              {fallbackDescription}
            </Text>
          </View>

          {/* Extra Premium Features Badges */}
          <View style={styles.featureContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#6D28D9" />
              <Text style={styles.featureText}>100% Genuine</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="cube" size={20} color="#6D28D9" />
              <Text style={styles.featureText}>Free Returns</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={20} color="#6D28D9" />
              <Text style={styles.featureText}>Next Day Delivery</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Premium Add to Cart Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <Text style={styles.bottomPriceValue}>Rs. {product.price.toLocaleString()}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addToCartButton} 
          onPress={handleAddToCart}
          activeOpacity={0.9}
        >
          <Ionicons name="cart" size={22} color="#fff" style={styles.cartIcon} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F6",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#6D28D9",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  scrollContent: {
    paddingBottom: 120, // ensure content is fully scrollable above fixed bottom bar
  },
  imageContainer: {
    width: width,
    height: 350,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  productName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6D28D9",
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  variantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  variantBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  variantBadgeSelected: {
    borderColor: "#6D28D9",
    backgroundColor: "#F5F3FF",
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  variantText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  variantTextSelected: {
    color: "#6D28D9",
    fontWeight: "600",
  },
  descriptionText: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 24,
  },
  featureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginTop: 8,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 6,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  priceContainer: {
    flexDirection: "column",
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  addToCartButton: {
    backgroundColor: "#6D28D9",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
