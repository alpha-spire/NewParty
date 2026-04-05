import { TouchableOpacity, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  size: "s" | "m" | "l";
};

export function EditButton(props: ButtonProps) {
  let padding = 0;
  let textSize = 0;
  let height = 0;
  let top = 0;
  let textBottom = 0;
  let bottom = 0;

  if (props.size == "s") {
    padding = 8;
    textSize = 15;
  } else if (props.size == "m") {
    padding = 5;
    textSize = 45;
    height = 65;
    top = 50;
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
        borderWidth: 1,
        borderColor: "white",
        left: 150,
        marginTop: 0,
        width: 65,
        top: top,
        height: height,
        bottom: bottom,
      }}
    >
      <AntDesign
        name="info"
        size={40}
        color={"white"}
        bottom={0}
        top={5}
        left={6}
      />
    </TouchableOpacity>
  );
}
