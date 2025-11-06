import { createStackNavigator } from "@react-navigation/stack";
import EventsScreen from "../screens/directory/Events";

// Create Stack Navigators for Home and Businesses
const EventsStack = createStackNavigator();
export default function EventsStackNavigator() {
  return (
    <EventsStack.Navigator>
      <EventsStack.Screen name="Events" component={EventsScreen} options={{ headerShown: false }} />
    </EventsStack.Navigator>
  );
}