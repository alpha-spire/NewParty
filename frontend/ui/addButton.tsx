import { TouchableOpacity, Text } from "react-native";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  colour: "black" | "grey" | "red" | "blue" | "yellow" | "pink" | "green";
  size: "s" | "m" | "l";
};

export function AddButton(props: ButtonProps) {
  let padding = 0;
  let textSize = 0;
  let height = 0;
  let top = 0;
  let textBottom = 0;
  let bottom = 0

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
    bottom = 50
  }

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        backgroundColor: props.colour,
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
        bottom: bottom
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: textSize,
          textAlign: "center",
          opacity: 5,
          bottom: textBottom,
        }}
      >
        {props.text}
      </Text>
    </TouchableOpacity>
  );
}
