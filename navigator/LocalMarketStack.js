import { createStackNavigator } from "@react-navigation/stack";
// import LoginScreen from "../screens/local-market/VendorLogin";
import VendorRegistrationScreen from "../screens/vendor-chain/AddVendor";
// import HomeScreen from "../screens/vendor-chain/VendorHome";
import BulkGroupsScreen from "../screens/vendor-chain/BulkGroupScreen";
import CustomeVendorGroup from "../components/createVendorGroup";
import SearchScreen from "../screens/vendor-chain/SearchScreen";
import OrdersScreen from "../screens/vendor-chain/OrderScreen";
import ProfileScreen from "../screens/vendor-chain/ProfileScreen";
import SupplyChainScreen from "../screens/vendor-chain/SupplyChain";
import VendorInventoryScreen from "../screens/vendor-chain/VendorInventoryScreen";
// import VendorDashboardScreen from "../screens/vendor-chain/VendorDashBoard";
import CustomerStoreScreen from "../screens/vendor-chain/CustomerStoreScreen";
import GroupManagementScreen from "../screens/vendor-chain/GroupManagementScreen";

import DiscussionThreadScreen from "../screens/vendor-chain/DiscussionThread";

// import StockFelaHome from "../screens/stokfella/Stokfela-Home";
// import MakeContributionScreen from "../screens/stokfella/Commit-Contributions";
// import GroupDetailsScreen from "../screens/stokfella/Groups-Details";
// import LoanRequestScreen from "../screens/stokfella/Loan-Details";
// import MemberProfile from "../screens/stokfella/Member-Profile";
// import TransactionsScreen from "../screens/stokfella/Member-Transactions";
// import CreateStokfelaScreen from "../screens/stokfella/Create-Stokfela";
// import ModalScreen from "../screens/stokfella/Modal";

// Create Stack Navigators for Home and Businesses
const LocalMarketStack = createStackNavigator();
export default function LocalMarketStackNavigator() {
  return (
    <LocalMarketStack.Navigator>
      {/* <LocalMarketStack.Screen name="VendorLogin" component={LoginScreen} options={{ headerShown: false }} /> */}
      {/* <LocalMarketStack.Screen name="VendorHome" component={HomeScreen} options={{ headerShown: false }} /> */}
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

      <LocalMarketStack.Screen name="DiscussionThread" component={DiscussionThreadScreen} options={{ headerShown: false }} />

      {/* <LocalMarketStack.Screen name="StokfelaHome" component={StockFelaHome} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="CreateGroup" component={CreateStokfelaScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="Contribute" component={MakeContributionScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="MakeLoan" component={LoanRequestScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="ViewProfile" component={MemberProfile} options={{ headerShown: false }} /> */}

      {/* <LocalMarketStack.Screen name="Transact" component={TransactionsScreen} options={{ headerShown: false }} />
      <LocalMarketStack.Screen name="Modal" component={ModalScreen} options={{ headerShown: false }} /> */}
    </LocalMarketStack.Navigator>
  );
}