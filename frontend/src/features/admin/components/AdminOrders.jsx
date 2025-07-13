import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllOrdersAsync, resetOrderUpdateStatus, selectOrderUpdateStatus, selectOrders, updateOrderByIdAsync } from '../../order/OrderSlice'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Avatar, Button, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useForm } from "react-hook-form"
import { toast } from 'react-toastify';
import {noOrdersAnimation} from '../../../assets/index'
import Lottie from 'lottie-react'


export const AdminOrders = () => {

  const dispatch=useDispatch()
  const orders=useSelector(selectOrders)
  const [editIndex,setEditIndex]=useState(-1)
  const orderUpdateStatus=useSelector(selectOrderUpdateStatus)
  const theme=useTheme()
  const is1620=useMediaQuery(theme.breakpoints.down(1620))
  const is1200=useMediaQuery(theme.breakpoints.down(1200))
  const is820=useMediaQuery(theme.breakpoints.down(820))
  const is480=useMediaQuery(theme.breakpoints.down(480))

  const {register, handleSubmit, formState: { errors }, reset, setValue} = useForm()

  useEffect(()=>{
    dispatch(getAllOrdersAsync())
  },[dispatch])


  useEffect(()=>{
    if(orderUpdateStatus==='fulfilled'){
      toast.success("Status updated")
      setEditIndex(-1)
      reset()
    }
    else if(orderUpdateStatus==='rejected'){
      toast.error("Error updating order status")
    }
  },[orderUpdateStatus])

  useEffect(()=>{
    return ()=>{
      dispatch(resetOrderUpdateStatus())
    }
  },[])


  const handleUpdateOrder=(data)=>{
    const update={
      id: orders[editIndex]._id, // Use 'id' instead of '_id' to match API
      data: data // Separate the data to match API structure
    }
    dispatch(updateOrderByIdAsync(update))
  }

  const handleCancelEdit = () => {
    setEditIndex(-1)
    reset()
  }

  const handleEditClick = (index) => {
    // Calculate the actual index in the original array since we're displaying reversed
    const actualIndex = orders.length - 1 - index
    setEditIndex(actualIndex)
    // Set the current status as default value
    setValue('status', orders[actualIndex].status)
  }

  const editOptions=['Pending','Confirmed','Dispatched','Out for delivery','Delivered','Cancelled']

  const getStatusColor=(status)=>{
    if(status==='Pending'){
      return {bgcolor:'#dfc9f7',color:'#7c59a4'}
    }
    else if(status==='Confirmed'){
      return {bgcolor:'#c8e6c9',color:'#2e7d32'}
    }
    else if(status==='Dispatched'){
      return {bgcolor:'#feed80',color:'#927b1e'}
    }
    else if(status==='Out for delivery'){
      return {bgcolor:'#AACCFF',color:'#4793AA'}
    }
    else if(status==='Delivered'){
      return {bgcolor:"#b3f5ca",color:"#548c6a"}
    }
    else if(status==='Cancelled'){
      return {bgcolor:"#fac0c0",color:'#cc6d72'}
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const calculateDiscountedPrice = (price, discountPercentage) => {
    return (price * (1 - discountPercentage / 100)).toFixed(2)
  }


  return (

    <Stack justifyContent={'center'} alignItems={'center'}>

      <Stack mt={5} mb={3}>

        {
          orders.length?
          <TableContainer sx={{width:is1620?"95vw":"auto", overflowX:'auto', maxWidth: '100vw'}} component={Paper} elevation={2}>
            <Table aria-label="simple table" sx={{minWidth: 1200}}>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell align="left">Order & User Details</TableCell>
                  <TableCell align="left">Items</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell align="right">Shipping Address</TableCell>
                  <TableCell align="right">Payment Details</TableCell>
                  <TableCell align="right">Order Date</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>

                {
                orders.length && orders.slice().reverse().map((order,index) => (

                  <TableRow key={order._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>

                    <TableCell component="th" scope="row">{orders.length - index}</TableCell>
                    
                    <TableCell align="left">
                      <Stack spacing={1}>
                        {/* Order ID Section */}
                        <Stack>
                          <Typography variant="body2" fontWeight={500} color="primary">
                            Order ID
                          </Typography>
                          <Typography variant="body2" sx={{fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block'}}>
                            {order._id}
                          </Typography>
                        </Stack>

                        {/* User Details Section */}
                        <Stack>
                          <Typography variant="body2" fontWeight={500} color="primary">
                            Customer Details
                          </Typography>
                          {typeof order.user === 'object' && order.user !== null ? (
                            <Stack spacing={0.5}>
                              <Typography variant="body2" fontWeight={500}>
                                {order.user.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                📧 {order.user.email}
                              </Typography>
                              <Typography variant="caption" sx={{fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: '#f0f0f0', padding: '1px 4px', borderRadius: '3px', display: 'inline-block'}}>
                                User ID: {order.user._id}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" sx={{fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', display: 'inline-block'}}>
                              User ID: {order.user}
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="left">
                      <Stack spacing={1}>
                        {
                          order.item.map((item, itemIndex)=>(
                            <Stack key={itemIndex} direction={'row'} alignItems={'center'} spacing={2}>
                              <Avatar src={item.product.thumbnail} sx={{width: 40, height: 40}}/>
                              <Stack>
                                <Typography variant="body2" fontWeight={500}>
                                  {item.product.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Brand: {item.product.brand.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Price: ${calculateDiscountedPrice(item.product.price, item.product.discountPercentage)} 
                                  {item.product.discountPercentage > 0 && (
                                    <span style={{textDecoration: 'line-through', marginLeft: 4}}>
                                      ${item.product.price}
                                    </span>
                                  )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Qty: {item.quantity}
                                </Typography>
                              </Stack>
                            </Stack>
                          ))
                        }
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={500}>
                        ${order.total}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack>
                        <Typography variant="body2">{order.address?.street}</Typography>
                        <Typography variant="body2">{order.address?.city}</Typography>
                        <Typography variant="body2">{order.address?.state}</Typography>
                        <Typography variant="body2">{order.address?.postalCode}</Typography>
                        <Typography variant="body2">{order.address?.country}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Phone: {order.address?.phoneNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Type: {order.address?.type}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Stack>
                        <Typography variant="body2">
                          Method: {order.paymentMode}
                        </Typography>
                        <Typography variant="body2">
                          Status: {order.paymentStatus}
                        </Typography>
                        {order.razorpay_order_id && (
                          <Typography variant="caption" color="text.secondary">
                            Order ID: {order.razorpay_order_id}
                          </Typography>
                        )}
                        {order.razorpay_payment_id && (
                          <Typography variant="caption" color="text.secondary">
                            Payment ID: {order.razorpay_payment_id}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Stack>
                        <Typography variant="body2">
                          {formatDate(order.createdAt)}
                        </Typography>
                        {order.updatedAt !== order.createdAt && (
                          <Typography variant="caption" color="text.secondary">
                            Updated: {formatDate(order.updatedAt)}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* order status */}
                    <TableCell align="right">

                        {
                          editIndex===(orders.length - 1 - index)?(

                        <form onSubmit={handleSubmit(handleUpdateOrder)}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="demo-simple-select-label">Update status</InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              label="Update status"
                              {...register('status',{required:'Status is required'})}
                              >
                              
                              {
                                editOptions.map((option)=>(
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))
                              }
                            </Select>
                          </FormControl>
                          {errors.status && (
                            <Typography variant="caption" color="error">
                              {errors.status.message}
                            </Typography>
                          )}
                        </form>
                        ):<Chip label={order.status} sx={getStatusColor(order.status)}/>
                        }
                      
                    </TableCell>

                    {/* actions */}
                    <TableCell align="right">

                      {
                        editIndex===(orders.length - 1 - index)?(
                          <Stack direction="row" spacing={1}>
                            <IconButton 
                              type='submit' 
                              color="primary"
                              onClick={handleSubmit(handleUpdateOrder)}
                            >
                              <CheckCircleOutlinedIcon/>
                            </IconButton>
                            <IconButton 
                              onClick={handleCancelEdit}
                              color="secondary"
                            >
                              <CancelOutlinedIcon/>
                            </IconButton>
                          </Stack>
                        )
                        :
                        <IconButton onClick={()=>handleEditClick(index)}>
                          <EditOutlinedIcon/>
                        </IconButton>
                      }

                    </TableCell>

                  </TableRow>
                ))}

              </TableBody>
            </Table>
          </TableContainer>
          :
          <Stack width={is480?"auto":'30rem'} justifyContent={'center'}>

            <Stack rowGap={'1rem'}>
                <Lottie animationData={noOrdersAnimation}/>
                <Typography textAlign={'center'} alignSelf={'center'} variant='h6' fontWeight={400}>There are no orders currently</Typography>
            </Stack>
              

          </Stack>  
        }
    
    </Stack>
    
    </Stack>
  )
}