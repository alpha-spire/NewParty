import { StyleSheet } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import UserScreen from "./screens/userSign/screen";
import ChatsScreen from "./screens/chats/ChatsScreen";
import EventScreen from "./screens/events/EventsScreen";
import AlbumsScreen from "./screens/albums/AlbumsScreen";
import FriendsScreen from "./screens/friends/FriendsScreen";
import PhotosScreen from "./screens/photos/PhotosScreen";
import CreateEventScreen from "./screens/events/CreateEventScreen";
import ModifyEventScreen from "./screens/events/ModifyEventScreen";
import FocusOnAlbumScreen from "./screens/albums/FocusOnAlbumScreen";
import CreateAlbumScreen from "./screens/albums/CreateAlbumScreen";
import CreateChatScreen from "./screens/chats/CreateChatScreen";
import ChatOnFocusScreen from "./screens/chats/ChatOnFocusScreen";
import FocusOnProfileScreen from "./screens/profile/ProfileScreen";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import user from "./reducers/user";
import event from "./reducers/event";
import {
  Fontisto,
  Entypo,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const store = configureStore({
  reducer: { user, event },
});

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { height: 100, paddingBottom: 0, paddingTop: 0 },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Album") {
            return (
              <Fontisto name="photograph" size={35} color={color} bottom={10} />
            );
          } else if (route.name === "Chat") {
            return <Entypo name="chat" size={35} color={color} bottom={10} />;
          } else if (route.name === "Photos") {
            return (
              <Entypo name="video-camera" size={35} color={color} bottom={10} />
            );
          } else if (route.name === "Friends") {
            return (
              <FontAwesome5
                name="user-friends"
                size={35}
                color={color}
                bottom={10}
              />
            );
          } else if (route.name === "Events") {
            return (
              <MaterialCommunityIcons
                name="party-popper"
                size={35}
                color={color}
                bottom={10}
              />
            );
          }
        },
        tabBarInactiveBackgroundColor: "#282828",
        tabBarActiveBackgroundColor: "#282828",
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#c3dde6b1",
        tabBarShowLabel: false,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Chat" component={ChatsScreen} />
      <Tab.Screen name="Album" component={AlbumsScreen} />
      <Tab.Screen name="Events" component={EventScreen} />
      <Tab.Screen name="Photos" component={PhotosScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
    </Tab.Navigator>
  );
  0;
};

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={UserScreen} />
          <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
          <Stack.Screen name="ModifyEvent" component={ModifyEventScreen} />
          <Stack.Screen name="CreateAlbum" component={CreateAlbumScreen} />
          <Stack.Screen name="FocusOnAlbum" component={FocusOnAlbumScreen} />
          <Stack.Screen name="CreateChat" component={CreateChatScreen} />
          <Stack.Screen name="ChatOnFocus" component={ChatOnFocusScreen} />
          <Stack.Screen name="FocusOnProfil" component={FocusOnProfileScreen} />
          <Stack.Screen name="TabNavigator" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  tabColor: {
    backgroundColor: "#282828",
    flex: 1,
  },
});
