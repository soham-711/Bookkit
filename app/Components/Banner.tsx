import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BANNERS = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop",
  },
];

const BANNER_WIDTH = SCREEN_WIDTH - 32;
const ITEM_WIDTH = SCREEN_WIDTH;

const BannerCarousel = () => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % BANNERS.length;
      scrollToIndex(nextIndex);
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * ITEM_WIDTH,
      animated: true,
    });
  };

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / ITEM_WIDTH);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.flatListWrapper}>
        <FlatList
          ref={flatListRef}
          data={BANNERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          snapToInterval={ITEM_WIDTH}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.contentContainer}
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
        />
      </View>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {BANNERS.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerCarousel;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    width: SCREEN_WIDTH,

    paddingBottom: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#7FC1C5",
  },
  flatListWrapper: {
    height: 160,
  },
  contentContainer: {
    alignItems: "center",
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: BANNER_WIDTH,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFDF8B", // Fallback color while image loads
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CFCFCF",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 18,
    backgroundColor: "#000000",
  },
});
