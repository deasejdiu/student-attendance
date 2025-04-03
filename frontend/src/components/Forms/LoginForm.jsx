import React from 'react';
import {Container, TextField,Button ,Box}from '@mui/material';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useNavigate} from 'react-router-dom';

function LoginForm (){
    const navigate =useNavigate()
    const formik = useFormik({
        initialValues:{
            username:'',
            password:'',
        },
        validationSchema:Yup.object({
            username: Yup.string()
            .max(15,'Must be 15 characters or less')
            .required('Required'),
            password: Yup.string()
            .min(6,'Password duhet te kete minimum 6 karaktere')
            .required('Required'),
        }),
        onSubmit: async(values,{ setSubmitting ,setErrors}) =>{
            try{
                const response = await fetch('http://localhost:5000/users/login',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify(values)
                });
                if(!response.ok){
                    const errorData = await response.json();
                    throw new Error(errorData.error);
                }
                sessionStorage.setItem('username', values.username)
                sessionStorage.setItem('IsLoggedIn' ,true)
                console.log('Login Successful');
            }catch(error){
                setErrors({
                    password:error.message});
            }
            setSubmitting(false);
        },
    });
    return(
        <Container maxWidth="sm">
            <Box sx={{ mt: 8}}>
                <form onSubmit ={formik.handleSubmit}>
                    <TextField
                    id="username"
                    name="username"
                    label="Username"
                    variant="outlined"
                    margin="normal"
                    autoComplete="username"
                    required
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                    />
                    <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    autoComplete="current-password"
                    required
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    />
                    <Button type="submit" fullWidth variant ="contained" color ="primary" sx={{mt:2}} disabled={formik.isSubmitting}>
                        Sign In 
                    </Button>
                    {formik.errors.password && <p style={{color:'red'}}>{formik.errors.password}</p>}
                    </form>
                </Box>
            </Container>
    );
}

export default LoginForm;