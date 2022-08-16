import styles from 'styles/pages/HomePage.module.css'
import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Typography,
  Button,
  Box,
  Grid,
  Divider,
  Card,
  CardContent,
  Alert,
  Pagination
} from '@mui/material'
import {
  Add as AddIcon
} from '@mui/icons-material'
import apolloClient from 'utils/apolloClient'
import {
  GET_POOLS,
  SUBSCRIPTION_POOL_CREATED
} from 'services/PollService'

const itemPerPage = 5;

const Home: NextPage = () => {
  const Router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [totalCount, setTotalCount] = useState(0);
  const [polls, setPolls] = useState<Array<any>>([]);

  useEffect(() => {
    // Loads pools
    apolloClient.query({
      query: GET_POOLS,
      variables: {
        itemPerPage: itemPerPage,
        pageNumber: 1
      }
    })
    .then((res) => {
      if(!res.error){
        setPolls(res.data.polls.polls)
        setTotalCount(res.data.polls.totalCount)
        setLoading(false);
      }else{
        setError(res.error.message);
      }
    })
    .catch((err) => {
      setError(err);
    })

    // Subscribe poll created
    var observerSubscriptionPoolCreated = apolloClient.subscribe({
      query: SUBSCRIPTION_POOL_CREATED
    });
    var subscriptionPoolCreated = observerSubscriptionPoolCreated.subscribe(({ data }) => {
      setPolls(prevState => {
        let prev = [...prevState]
        if(prev.length === itemPerPage){
          prev.pop();
        }
        prev.unshift(data.pollCreated);
        return prev
      })
    })
  
    return () => {
      // Unsubscribe
      subscriptionPoolCreated.unsubscribe();
    }
  }, [])

  const handlePageChange = (e, pageNumber) => {
    e.preventDefault();

    apolloClient.query({
      query: GET_POOLS,
      variables: {
        itemPerPage: itemPerPage,
        pageNumber: pageNumber
      }
    })
    .then((res) => {
      if(!res.error){
        setPolls(res.data.polls.polls)
        setTotalCount(res.data.polls.totalCount)
        setLoading(false);
      }else{
        setError(res.error.message);
      }
    })
    .catch((err) => {
      setError(err);
    })
  }
  
  
  if(loading) return <div>Loading...</div>
  if(error) return <div>Error: {error}</div>

  return (
    <Box display="flex" justifyContent="center" alignItems="center" style={{minHeight: '100vh'}}>
      <div style={{margin: '1rem', minWidth: '400px'}}>
        <Card style={{backgroundColor: "#F9F3EE", borderRadius: '.5rem', marginBottom: '.5rem'}}>
            <CardContent sx={{padding: '.3rem !important'}}>
                <Button onClick={() => Router.push('/createPoll')} startIcon={<AddIcon/>} variant="text" color="success">New Poll</Button>
            </CardContent>
        </Card>
        <Card style={{backgroundColor: "#F9F3EE", borderRadius: '1rem', padding: '.5rem 1rem', maxWidth: '500px'}}>
          <CardContent>
            <Grid container direction="column" rowSpacing={2}>  
              <Grid item xs={12}>
                <Typography fontWeight="600" fontSize="30px">Polls</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider/>
              </Grid>
              {
                polls.length === 0 ? 
                <Grid item xs={12}>
                  <Alert color="info">There is no pool yet.</Alert>
                </Grid>
                :
                <>
                  <Grid item xs={12} container rowSpacing={{xs: 1, sm: 2}}>
                    {
                      polls.map((poll : any, index) => (
                        <Grid item xs={12} key={index}>
                          <Card className={styles.pollCard} onClick={() => Router.push(`/poll/${poll._id}`)}>
                            <CardContent sx={{padding: '1rem !important'}}>
                              {poll.title}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    }
                  </Grid>
                  <Grid item xs={12}>
                    <Divider/>
                  </Grid>
                  {
                    totalCount === 0 ?
                    null
                    :
                    <Grid item xs={12}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Pagination onChange={handlePageChange} count={Math.ceil(totalCount / itemPerPage)} variant="outlined" shape="rounded" showFirstButton showLastButton/>
                      </div>
                    </Grid>
                  }
                </>
              }
            </Grid>
          </CardContent>
        </Card>
      </div>
    </Box>
  )
}

export default Home
