import { createStackNavigator } from '@react-navigation/stack';
import PublicationScreen from "../screens/directory/PublicationScreen";
import BusinessArticlesScreen from "../screens/directory/BusinessArticlesScreen";

const PublicationsStack = createStackNavigator();
export default function PublicationsStackNavigator() {
  return (
    <PublicationsStack.Navigator>
      <PublicationsStack.Screen name="PublicationList" component={PublicationScreen} options={{ headerShown: false }} />
      <PublicationsStack.Screen
        name="BusinessArticlesScreen" component={BusinessArticlesScreen} options={{ headerShown: false }}
      />
    </PublicationsStack.Navigator>
  );
}