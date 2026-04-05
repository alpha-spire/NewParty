import { TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export type ButtonProps = {
  text: string;
  onPress: () => void;
  size: "s" | "m" | "l";
};

export function SendButton(props: ButtonProps) {
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
    height = 50;
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
        padding: padding,
        borderRadius: 45,
        borderWidth: 1.5,
        borderColor: "white",
        marginTop: 0,
        width: 50,
        height: height,
        backgroundColor: "#7fb8ff",
      }}
    >
      <AntDesign
        name="send"
        size={20}
        color={"white"}
        bottom={0}
        top={8}
        left={10}
      />
    </TouchableOpacity>
  );
}
