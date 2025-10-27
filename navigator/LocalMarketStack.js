import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/local-market/VendorLogin";
import VendorRegistrationScreen from "../screens/local-market/AddVendor";
import HomeScreen from "../screens/local-market/VendorHome";
import BulkGroupsScreen from "../screens/local-market/BulkGroupScreen";
import CustomeVendorGroup from "../components/customeVendorGroup";
import SearchScreen from "../screens/local-market/SearchScreen";
import OrdersScreen from "../screens/local-market/OrderScreen";
import ProfileScreen from "../screens/local-market/ProfileScreen";
import SupplyChainScreen from "../screens/local-market/SupplyChain";
import VendorInventoryScreen from "../screens/local-market/VendorInventoryScreen";
import VendorDashboardScreen from "../screens/local-market/VendorDashBoard";
import CustomerStoreScreen from "../screens/local-market/CustomerStoreScreen";
import GroupManagementScreen from "../screens/local-market/GroupManagementScreen";

import StockFelaHome from "../screens/stokfella/Stokfela-Home";
import MakeContributionScreen from "../screens/stokfella/Commit-Contributions";
import GroupDetailsScreen from "../screens/stokfella/Groups-Details";
import LoanRequestScreen from "../screens/stokfella/Loan-Details";
import MemberProfile from "../screens/stokfella/Member-Profile";
import TransactionsScreen from "../screens/stokfella/Member-Transactions";
import CreateStokfelaScreen from "../screens/stokfella/Create-Stokfela";
import ModalScreen from "../screens/stokfella/Modal";

// Create Stack Navigators for Home and Businesses
const LocalMarketStack = createStackNavigator();
export default function LocalMarketStackNavigator() {
  return (
    <LocalMarketStack.Navigator>
      <LocalMarketStack.Screen name="VendorLogin" component={LoginScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="VendorHome" component={HomeScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="AddVendor" component={VendorRegistrationScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="OrdersScreen" component={OrdersScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />

      <LocalMarketStack.Screen name="BulkGroupsScreen" component={BulkGroupsScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="GroupForm" component={CustomeVendorGroup} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="SupplyChain" component={SupplyChainScreen} options={{ headerShown: false }} />

      <LocalMarketStack.Screen name="VendorInventory" component={VendorInventoryScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="VendorDashBoard" component={VendorDashboardScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="MakertStore" component={CustomerStoreScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="GroupManagement" component={GroupManagementScreen} options={{ headerShown: false }} />

      <LocalMarketStack.Screen name="StokfelaHome" component={StockFelaHome} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="CreateGroup" component={CreateStokfelaScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="Contribute" component={MakeContributionScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="MakeLoan" component={LoanRequestScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="ViewProfile" component={MemberProfile} options={{ headerShown: false }} />

      <LocalMarketStack.Screen name="Transact" component={TransactionsScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="Modal" component={ModalScreen} options={{ headerShown: false }} />
    </LocalMarketStack.Navigator>
  );
}