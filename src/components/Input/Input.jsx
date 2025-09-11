import { InputComponent } from "./InputStyled";

export function Input(props) {
  return (
    <InputComponent
      type={props.type}
      defaultValue={props.defaultValue}
      name={props.name}
      placeholder={props.placeholder}
      onChange={props.onChange}
    />
  );
}
