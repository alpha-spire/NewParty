import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  size: "s" | "m" | "l" | "g" | "k";
};

export function EditButton(props: ButtonProps) {
  let padding = 0;
  let textSize = 0;
  let height = 0;
  let top = 0;
  let textBottom = 0;
  let bottom = 0;
  let left = 0;

  if (props.size == "s") {
    padding = 8;
    textSize = 15;
  } else if (props.size == "m") {
    padding = 5;
    textSize = 45;
    height = 65;
    top = 45;
    textBottom = 3;
    left = -55;
  } else if (props.size == "l") {
    padding = 5;
    textSize = 45;
    height = 65;
    textBottom = 14;
    top = -50;
    bottom = 50;
    left = 150;
  } else if (props.size == "g") {
    padding = 5;
    textSize = 45;
    height = 65;
    top = 0;
    textBottom = 3;
    left = -55;
  } else if (props.size == "k") {
    padding = 5;
    textSize = 45;
    height = 65;
    top = 85;
    textBottom = 3;
    left = -130;
  }

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        padding: padding,
        borderRadius: 45,
        margin: 5,
        borderWidth: 1,
        borderColor: "white",
        left: left,
        marginTop: 0,
        width: 65,
        top: top,
        height: height,
        bottom: bottom,
      }}
    >
      <Ionicons
        name="create-outline"
        size={30}
        color={"white"}
        bottom={0}
        top={9}
        left={13}
      />
    </TouchableOpacity>
  );
}
