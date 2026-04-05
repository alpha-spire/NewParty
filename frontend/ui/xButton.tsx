import { TouchableOpacity, Text } from "react-native";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  colour: "black" | "grey" | "red" | "blue" | "yellow" | "pink";
  size: "s" | "m" | "l";
};

export function Xbutton(props: ButtonProps) {
  let padding = 0;
  let textSize = 0;
  let bottom = 0;
  let left = 0;

  if (props.size == "s") {
    padding = 8;
    textSize = 15;
    bottom = 60;
    left = 100;
  } else if (props.size == "m") {
    padding = 8;
    textSize = 15;
    left = 110;
    bottom = -10;
  } else if (props.size == "l") {
    padding = 8;
    textSize = 15;
    left = 110;
    bottom = 40;
  }

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        backgroundColor: props.colour,
        padding: padding,
        borderRadius: 45,
        margin: 10,
        opacity: 0.8,
        borderWidth: 1,
        borderColor: "white",
        left: left,
        bottom: bottom,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: textSize,
          textAlign: "center",
          opacity: 5,
        }}
      >
        {props.text}
      </Text>
    </TouchableOpacity>
  );
}
