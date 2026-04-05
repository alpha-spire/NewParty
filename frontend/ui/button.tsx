import { TouchableOpacity, Text } from "react-native";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  colour: "black" | "grey" | "red" | "blue" | "yellow" | "pink" | "green";
  size: "s" | "m" | "l";
};

export function Button(props: ButtonProps) {
  let padding = 0;
  let textSize = 0;
  let bottom = 0;

  if (props.size == "s") {
    padding = 10;
    textSize = 25;
  } else if (props.size == "m") {
    padding = 20;
    textSize = 30;
  } else if (props.size == "l") {
    padding = 50;
    textSize = 50;
  }

  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        backgroundColor: props.colour,
        padding: padding,
        borderRadius: 45,
        margin: 30,
        opacity: 0.7,
        borderWidth: 1,
        borderColor: "white",
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
