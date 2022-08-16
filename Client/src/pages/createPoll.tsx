import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useFormik } from "formik"
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Divider,
    TextField,
    InputAdornment,
    Button,
    Alert
} from '@mui/material'
import {
    Title as TitleIcon,
    SettingsSuggest as OptionIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Check as ConfirmIcon,
    Home as HomeIcon
} from '@mui/icons-material'
import * as yup from 'yup'
import apolloClient from "utils/apolloClient";
import {
    CREATE_POOL
} from 'services/PollService'

const CreatePoll : NextPage = () => {
    const Router = useRouter();

    const formik = useFormik({
        initialValues: {
            pollTitle: '',
            options: [
                { name: ''},
                { name: ''}
            ]
        },
        validationSchema: yup.object({
            pollTitle: yup.string().required("Poll title is required."),
            options: yup.array().of(yup.object().shape({
                name: yup.string().required("Option name is required."),
            })).min(2)
        }),
        onSubmit: ({ pollTitle, options }) => {
            apolloClient.mutate({
                mutation: CREATE_POOL,
                variables: {
                    title: pollTitle,
                    options: options
                }
            }).then((res) => {
                if(!res.errors){
                    var pollId = res.data.createPoll._id;
                    Router.push(`poll/${pollId}`);
                }
            })
            .catch((err) => {
                console.log(err)
            })
        }
    });

    const addOption = (e) => {
        const options = [...formik.values.options];
        options.push({name: ''});
        formik.setValues({
            ...formik.values,
            options
        })
    }

    const removeOption = (e) => {
        const options = [...formik.values.options];
        options.pop();
        formik.setValues({
            ...formik.values,
            options
        })
    }

    return(
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" style={{minHeight: '100vh'}}>
            <div style={{margin: '1rem'}}>
                <Card style={{backgroundColor: "#F9F3EE", borderRadius: '.5rem', marginBottom: '.5rem', width: 'fit-content'}}>
                    <CardContent sx={{padding: '.3rem !important'}}>
                        <Button onClick={() => Router.push('/')} startIcon={<HomeIcon/>} variant="text">Polls</Button>
                    </CardContent>
                </Card>
                <Card style={{backgroundColor: "#F9F3EE", borderRadius: '1rem', padding: '.5rem 1rem', maxWidth: '500px'}}>
                    <CardContent>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container direction="column" rowSpacing={4}>  
                                <Grid item xs={12}>
                                    <Typography fontWeight="600" fontSize="30px">Create Poll</Typography>
                                    <Divider/>
                                </Grid>
                                <Grid item xs={12} container direction="column" rowSpacing={1}>
                                    <Grid item xs>
                                        <TextField
                                            name="pollTitle"
                                            value={formik.values.pollTitle}
                                            onChange={formik.handleChange}
                                            error={formik.touched.pollTitle && Boolean(formik.errors.pollTitle)}
                                            helperText={formik.touched.pollTitle && formik.errors.pollTitle}
                                            label="Poll Title"
                                            sx={{ m: 1 }}
                                            fullWidth
                                            inputProps={{
                                                maxLength: 50
                                            }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><TitleIcon/></InputAdornment>
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs>
                                        <Typography fontWeight="400" fontSize="16px">Options</Typography>
                                        {
                                            formik.values.options && formik.values.options.length < 2 ?
                                                <Alert color="error">There must be at least 2 option.</Alert>
                                            : null
                                        }
                                    </Grid>
                                    <Grid item xs container columnSpacing={1}>
                                        {
                                            formik.values.options.map((option, index) => {
                                                const optionErrors = formik.errors.options?.length && formik.errors.options[index];
                                                const optionTouched = formik.touched.options?.length && formik.touched.options[index];
                                                return(
                                                    <Grid item xs={12} sm={6} key={index}>
                                                        <TextField
                                                            name={`options.${index}.name`}
                                                            value={formik.values.options[index].name}
                                                            onChange={formik.handleChange}
                                                            error={Boolean(optionErrors && optionTouched && optionErrors['name'] && optionTouched.name)}
                                                            helperText={(Boolean(optionErrors && optionTouched && optionErrors['name'] && optionTouched.name)) ? optionErrors!['name'] : null}
                                                            label={`Option ${index + 1}`}
                                                            sx={{ m: 1 }}
                                                            fullWidth
                                                            inputProps={{
                                                                maxLength: 20
                                                            }}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start"><OptionIcon/></InputAdornment>,
                                                            }}
                                                        />
                                                    </Grid>
                                                );
                                            })
                                        }
                                    </Grid>
                                    <Grid item xs container>
                                        <Grid item xs={6}>
                                            <Button onClick={addOption} startIcon={<AddIcon/>} color="success" size="small" fullWidth>Add</Button>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Button onClick={removeOption} startIcon={<RemoveIcon/>} color="error" size="small" fullWidth>Remove</Button>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs>
                                        <Button disabled={!formik.isValid} type="submit" startIcon={<ConfirmIcon/>} color="success" variant="contained" fullWidth>Add Poll</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Box>
    );
}

export default CreatePoll;