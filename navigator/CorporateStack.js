import { createStackNavigator } from "@react-navigation/stack";
// import CorporatesScreen from "../screens/directory/Corporate"



// Create Stack Navigators for Home and Businesses
const CorporateStack = createStackNavigator();
export default function CorporateStackNavigator() {
  return (
    <CorporateStack.Navigator>
      {/* <CorporateStack.Screen name="Corporates" component={CorporatesScreen} options={{ headerShown: false }} /> */}
    </CorporateStack.Navigator>
  );
}