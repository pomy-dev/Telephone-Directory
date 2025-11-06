import { createStackNavigator } from '@react-navigation/stack';
import FavoritesScreen from '../screens/directory/FavoritesScreen';
import BusinessDetailsScreen from "../screens/directory/BusinessDetailsScreen";
import BusinessArticlesScreen from "../screens/directory/BusinessArticlesScreen"

const FavoriteStack = createStackNavigator();
export default function FavoritesStackNavigator() {
  return (
    <FavoriteStack.Navigator>
      <FavoriteStack.Screen name="FavoritesMain" component={FavoritesScreen} options={{ headerShown: false }} />
      <FavoriteStack.Screen name="BusinessDetail" component={BusinessDetailsScreen} options={{ headerShown: false }} />
      <FavoriteStack.Screen name="BusinessArticle" component={BusinessArticlesScreen} options={{ headerShown: false }} />
    </FavoriteStack.Navigator>
  );
}