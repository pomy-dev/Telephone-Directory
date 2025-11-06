import { createStackNavigator } from '@react-navigation/stack';
import BusinessesScreen from '../screens/directory/BusinessesScreen';
import BusinessDetailsScreen from "../screens/directory/BusinessDetailsScreen"
import BusinessList from "../screens/directory/BusinessListScreen"
import BusinessArticlesScreen from "../screens/directory/BusinessArticlesScreen"

const BusinessesStack = createStackNavigator();
export default function BusinessesStackNavigator() {
    return (
        <BusinessesStack.Navigator>
            <BusinessesStack.Screen name="BusinessesMain" component={BusinessesScreen} options={{ headerShown: false }} />
            <BusinessesStack.Screen name="BusinessDetail" component={BusinessDetailsScreen} options={{ headerShown: false }} />
            <BusinessesStack.Screen name="BusinessList" component={BusinessList} options={{ headerShown: false }} />
            <BusinessesStack.Screen name="BusinessArticle" component={BusinessArticlesScreen} options={{ headerShown: false }} />
        </BusinessesStack.Navigator>
    );
}