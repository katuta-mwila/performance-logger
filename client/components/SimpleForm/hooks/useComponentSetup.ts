import { useContext } from "react";
import InputProps from "../Inputs/InputProps";
import SimpleInput from "../Inputs/SimpleInput";
import { SimpleFormInstanceContext } from "../Form/SimpleFormInstance";

export default function<T extends SimpleInput<unknown>>(props: InputProps<T>){
  const form = useContext(SimpleFormInstanceContext)!
  let input: T

  if (typeof(props.input) === 'string'){
    const formInput = form.getInput(props.input)
    if (formInput == undefined) throw new Error("Cannot get form input of id " + props.input)
    input = formInput as T
  } else 
    input = props.input

    input = input as T

    const finalProps: {[key: string]: unknown} = {input}

    Object.keys(input).forEach((key) =>{
      finalProps[key] = props[key] || input[key]
    })

    return {input, finalProps: finalProps as InputProps<T>}
}