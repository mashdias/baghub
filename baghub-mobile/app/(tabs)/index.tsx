import { useEffect, useState } from "react";
import { Text, View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

// (Type)
type Product = {
  id: string;
  name: string;
  price: number;
  variants?: { imageUrl: string }[];
};

export default function Index() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔴 
  const API_URL = "http://172.26.2.112:3000/api/products";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data.products || data);
        setProducts(data.products || data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
        alert("Failed to load products. Check your IP and Wi-Fi!");
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandName}>BAG HUB</Text>
        <Text style={styles.subtitle}>Latest Collections</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6D28D9" />
          <Text style={styles.loadingText}>Loading bags...</Text>
        </View>
      ) : products.length === 0 ? (
        <Text style={styles.loadingText}>No bags found!</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const rawImageUrl = item.variants?.[0]?.imageUrl;
            const absoluteImageUrl = rawImageUrl 
              ? (rawImageUrl.startsWith('/') ? `http://172.26.2.112:3000${rawImageUrl}` : rawImageUrl)
              : 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=400&auto=format&fit=crop';

            return (
              <View style={styles.card}>
                <Image
                  source={{ uri: absoluteImageUrl }}
                  style={styles.productImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.bagName}>{item.name}</Text>
                  <Text style={styles.bagPrice}>Rs. {item.price.toLocaleString()}</Text>
                  <TouchableOpacity 
                    style={styles.buyButton}
                    onPress={() => router.push('/product/' + item.id)}
                  >
                    <Text style={styles.buyButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

// 🎨 ලස්සන කරන කේත (CSS වගේ)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  brandName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6D28D9",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  bagName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  bagPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
});