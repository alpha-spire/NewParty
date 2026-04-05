import { TouchableOpacity, Text } from "react-native";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  colour: "black" | "grey" | "red" | "blue" | "yellow" | "pink" | "#92ff2daf";
  size: "s" | "m" | "l";
};

export function CreateButton(props: ButtonProps) {
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
        borderWidth: 1,
        borderColor: "white",
        left:  285,
        bottom: 25,
        width: 65,
        height: height,
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
