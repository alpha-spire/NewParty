import { TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  size: "s" | "m" | "l";
};

export function DeleteButton(props: ButtonProps) {
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
    height = 52.5;
    top = -82.5;
    left = 225;
    textBottom = 3;
  } else if (props.size == "l") {
    padding = 5;
    textSize = 45;
    height = 65;
    textBottom = 14;
    top = -50;
    bottom = 50;
  }

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        padding: padding,
        borderRadius: 45,
        margin: 5,
        borderWidth: 2,
        borderColor: "#bf0000",
        left: left,
        marginTop: 0,
        width: 52.5,
        top: top,
        height: height,
        bottom: bottom,
      }}
    >
      <Feather
        name="trash-2"
        size={27.5}
        color={"#bf0000"}
        bottom={0}
        top={4}
        left={5}
      />
    </TouchableOpacity>
  );
}
