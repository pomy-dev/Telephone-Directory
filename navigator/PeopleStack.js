import { createStackNavigator } from "@react-navigation/stack";
import PeopleScreen from "../screens/directory/PeopleProfiles"
import ProfileScreen from "../screens/directory/AddProfile"



// Create Stack Navigators for Home and Businesses
const PeopleStack = createStackNavigator();
export default function PeopleStackNavigator() {
  return (
    <PeopleStack.Navigator>
      <PeopleStack.Screen name="People" component={PeopleScreen} options={{ headerShown: false }} />
      <PeopleStack.Screen name="AddProfile" component={ProfileScreen} options={{ headerShown: false }} />
    </PeopleStack.Navigator>
  );
}