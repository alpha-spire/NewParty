import { TouchableOpacity, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  colour: "black" | "grey" | "red" | "blue" | "yellow" | "pink" | "#1b1b1b";
  size: "s" | "m" | "l";
};

export function AddMemberButton(props: ButtonProps) {
  let padding = 0;
  let textSize = 0;
  let height = 0;
  let textBottom = 0;

  if (props.size == "s") {
    padding = 8;
    textSize = 15;
  } else if (props.size == "m") {
    padding = 5;
    textSize = 45;
    height = 65;
    textBottom = 3;
  } else if (props.size == "l") {
    padding = 5;
    textSize = 45;
    height = 65;
    textBottom = 14;
  }

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        backgroundColor: props.colour,
        padding: padding,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: "white",
        left: 285,
        bottom: 25,
        width: 65,
        height: height,
      }}
    >
      <AntDesign
        name="user-add"
        size={40}
        color={"white"}
        bottom={0}
        top={5}
        left={5}
      />
    </TouchableOpacity>
  );
}
