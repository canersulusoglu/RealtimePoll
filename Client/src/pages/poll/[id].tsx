import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as yup from 'yup'
import {
    Box,
    Card,
    CardContent,
    Button,
    Grid,
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    FormHelperText,
    Radio,
    LinearProgress,
    Divider
} from '@mui/material'
import {
    Home as HomeIcon,
    HowToVote as VoteIcon,
    Add as AddIcon
} from '@mui/icons-material'
import apolloClient from "utils/apolloClient";
import {
    GET_POOL,
    VOTE_POOL,
    SUBSCRIPTION_POOL_VOTED
} from 'services/PollService'

const Poll : NextPage = () => {
    const Router = useRouter();
    const pollId = Router.query.id;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [poll, setPoll] = useState<any>({});
    const [options, setOptions] = useState<Array<any>>([]);
    const [pollVoted, setPollVoted] = useState(false);

    const formik = useFormik({
        initialValues: {
            selectedOption: ''
        },
        validationSchema: yup.object({
            selectedOption: yup.string().required("You must select option.")
        }),
        onSubmit: ({ selectedOption }) => {
            apolloClient.mutate({
                mutation: VOTE_POOL,
                variables: {
                    pollId: String(pollId),
                    optionId: String(selectedOption)
                }
            })
            .then((res) => {
                if(!res.error){
                    setPollVoted(true);
                }else{
                    setError(res.error.message);
                }
            })
            .catch((err) => {
                setError(err);
            })
        }
    });

    useEffect(() => {
        if(!Router.isReady) return;
        apolloClient.query({
            query: GET_POOL,
            variables: {
                pollId: String(pollId)
            }
        })
        .then((res) => {
            if(!res.error){
                setPoll(res.data.poll)
                setOptions(res.data.poll.options)
                setLoading(false);
            }else{
                setError(res.error.message);
            }
        })
        .catch((err) => {
            setError(err);
        })

        // Subscribe vote
        var observerSubscriptionPollVoted = apolloClient.subscribe({
            query: SUBSCRIPTION_POOL_VOTED,
            variables: {
                pollId: String(pollId)
            }
        });
        var subscriptionPollVoted = observerSubscriptionPollVoted.subscribe(({ data }) => {
            var option = data.pollVoted.option;
            setOptions(prevState => {
                var newOptions = [...prevState]
                var index = newOptions.findIndex(x => x._id === option._id)
                var newOption = {...newOptions[index]};
                newOption.count = option.count;
                newOptions.splice(index, 1);
                newOptions.push(newOption);
                newOptions.sort((a, b) => {
                    if(a.count < b.count) return 1;
                    if(a.count > b.count) return -1;
                    return 0;
                })
                return newOptions
            })
        })
        
        return () => {
            // Unsubscribe
            subscriptionPollVoted.unsubscribe();
        }
    }, [pollId])
    
    if(loading) return <div>Loading...</div>
    if(error) return <div>Error: {error}</div>

    return(
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" style={{minHeight: '100vh'}}>
            <div style={{margin: '1rem'}}>
                <Card style={{backgroundColor: "#F9F3EE", borderRadius: '.5rem', marginBottom: '.5rem', minWidth: '400px'}}>
                    <CardContent sx={{padding: '.3rem !important', display: 'flex', justifyContent: 'space-between'}}>
                        <Button onClick={() => Router.push('/')} startIcon={<HomeIcon/>} variant="text">Polls</Button>
                        <Button onClick={() => Router.push('/createPoll')} startIcon={<AddIcon/>} variant="text" color="success">New Poll</Button>
                    </CardContent>
                </Card>
                <Card style={{backgroundColor: "#F9F3EE", borderRadius: '1rem', padding: '.5rem 1rem', maxWidth: '500px'}}>
                    <CardContent>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container direction="column" rowSpacing={2}>  
                                <Grid item xs={12}>
                                    <Typography fontWeight="600" fontSize="30px">{poll.title}</Typography>
                                </Grid>
                                {
                                    !pollVoted ?
                                    <>
                                        <Grid item xs={12}>
                                            <FormControl error={formik.touched.selectedOption && Boolean(formik.errors.selectedOption)}>
                                                <RadioGroup
                                                    name="selectedOption"
                                                    value={formik.values.selectedOption}
                                                    onChange={formik.handleChange}
                                                >
                                                    {
                                                        poll.options.map((option, index) => {
                                                            return(
                                                                <FormControlLabel 
                                                                    key={index} 
                                                                    value={option._id}
                                                                    label={option.name}
                                                                    control={<Radio />} 
                                                                />
                                                            );
                                                        })
                                                    }
                                                </RadioGroup>
                                                <FormHelperText>{formik.touched.selectedOption && formik.errors.selectedOption}</FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button type="submit" fullWidth startIcon={<VoteIcon/>} color="success" variant="contained">Vote</Button>
                                        </Grid>
                                    </>
                                    : 
                                    <>
                                        {
                                            options.map((option, index) => {
                                                const percentage = ((option.count / options.reduce((acc, object) => {return acc + object.count}, 0)) * 100);
                                                return(
                                                    <Grid item xs={12} key={index}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                                            <Box sx={{ width: '100%', mr: 1 }}>
                                                                <Typography textAlign="start" fontSize="18px" fontWeight="400">
                                                                    {option.name}
                                                                </Typography>
                                                                <LinearProgress 
                                                                    value={percentage} 
                                                                    variant="determinate" 
                                                                    sx={{height: '1rem', borderRadius: '1rem'}}
                                                                />
                                                            </Box>
                                                            <Box sx={{ minWidth: '50px' }}>
                                                                <Typography textAlign="center" variant="body1" lineHeight=".9rem" color="text.secondary">
                                                                    {option.count} votes ({percentage.toFixed(2)}%)
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Divider/>
                                                    </Grid>
                                                );
                                            })
                                        }
                                    </>
                                }
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Box>
    );
}

export default Poll;