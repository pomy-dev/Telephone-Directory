import { createStackNavigator } from "@react-navigation/stack";
// import StockFelaHome from "../screens/stokfella/Stokfela-Home";
import MakeContributionScreen from "../screens/stokfella/Commit-Contributions";
import GroupDetailsScreen from "../screens/stokfella/Groups-Details";
import LoanRequestScreen from "../screens/stokfella/Loan-Details";
import MemberProfile from "../screens/stokfella/Member-Profile";
import TransactionsScreen from "../screens/stokfella/Member-Transactions";
import CreateStokfelaScreen from "../screens/stokfella/Create-Stokfela";
import ModalScreen from "../screens/stokfella/Modal";

// Create Stack Navigators for Home and Businesses
const StokfelaStack = createStackNavigator();
export default function StokfelaStackNavigator() {
  return (
    <StokfelaStack.Navigator>
      {/* <StokfelaStack.Screen name="StokfelaHome" component={StockFelaHome} options={{ headerShown: false }} /> */}
      <StokfelaStack.Screen name="CreateGroup" component={CreateStokfelaScreen} options={{ headerShown: false }} />
      <StokfelaStack.Screen name="Contribute" component={MakeContributionScreen} options={{ headerShown: false }} />
      <StokfelaStack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ headerShown: false }} />
      <StokfelaStack.Screen name="MakeLoan" component={LoanRequestScreen} options={{ headerShown: false }} />
      <StokfelaStack.Screen name="ViewProfile" component={MemberProfile} options={{ headerShown: false }} />

      <StokfelaStack.Screen name="Transact" component={TransactionsScreen} options={{ headerShown: false }} />
      <StokfelaStack.Screen name="Modal" component={ModalScreen} options={{ headerShown: false }} />
    </StokfelaStack.Navigator>
  );
}