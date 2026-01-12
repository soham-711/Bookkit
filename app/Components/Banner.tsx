import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BANNERS = [
  {
    id: "1",
    image: require("../../assets/images/Banner1.jpeg"),
  },
  {
    id: "2",
    image: require("../../assets/images/Banner2.jpeg"),
  },
  {
    id: "3",
    image: require("../../assets/images/Banner3.jpeg"),
  },
   {
    id: "4",
    image: require("../../assets/images/Banner4.jpeg"),
  },
   {
    id: "5",
    image: require("../../assets/images/Banner3.jpeg"),
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
          source={ item.image }
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
    borderBottomColor: "#e0e8ecff",
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
