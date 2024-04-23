//import { c } from 'msw/lib/glossary-de6278a9'
import React, { useEffect, useState } from 'react'
import * as yup from "yup"
import axios from 'axios'


// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const formSchema = yup.object().shape({
  fullName: yup.string().trim()
  .min(3, validationErrors.fullNameTooShort)
  .max(20, validationErrors.fullNameTooLong),
size: yup.string()
  .matches(/^(S|M|L)$/, validationErrors.sizeIncorrect),
toppings: yup.array()
})
// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
  const [formValues, setFormValues] = useState({
    fullName: '',
    size: '',
    toppings: [],
  });
  const [errors, setErrors] = useState({fullName: "", size: ""})
  const [enable, setEnable] = useState(false)
  const [success, setSuccess] = useState("")
  const [failure, setFailure] = useState("")

  useEffect(() => {
    formSchema.isValid(formValues).then((isValid) => {
      setEnable(isValid);
    });
  }, [formValues]);
  
  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post("http://localhost:9009/api/order", formValues)
      .then(res => {
        setSuccess(res.data.message)
        setFormValues({fullName: "", size: "", toppings: []})
        setFailure()
      })
      .catch(err => {
        setFailure(err.response.data.message)
        setSuccess()
      })
  }
  const handleChange = (event) => {
    let {name, value, checked} = event.target;
    if (name === 'toppings') {
      const updatedToppings = checked
        ? [...formValues.toppings, value]
        : formValues.toppings.filter(toppingId => toppingId !== value);
  
      setFormValues({ ...formValues, toppings: updatedToppings });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
    yup
      .reach(formSchema, name)
      .validate(value)
      .then(() => {
        setErrors({...errors, [name]: ""})
      })
      .catch(err => {
        const errorMessage = err.errors && err.errors.length > 0 ? err.errors[0] : 'Validation error';
  setErrors({ ...errors, [name]: errorMessage });
      })
  }
  

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input value={formValues.fullName} onChange={handleChange} name="fullName" placeholder="Type full name" id="fullName" type="text" />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select onChange={handleChange} name='size' value={formValues.size} id="size">
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map(topping => <label key={topping.topping_id}>
          <input
            id={topping.topping_id}
            checked={formValues.toppings.includes(topping.topping_id)}
            onChange={handleChange}
            name="toppings"
            type="checkbox"
            value={topping.topping_id}
          />
          {topping.text}<br />
        </label>)}
        
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled = {!enable}/>
    </form>
  )
}
