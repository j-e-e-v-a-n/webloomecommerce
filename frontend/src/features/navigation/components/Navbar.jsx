import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Stack, useMediaQuery, useTheme, styled } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo } from '../../user/UserSlice';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';

// Styled Components
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  minHeight: 'auto',
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(4px)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.spacing(2),
    marginTop: theme.spacing(1),
    minWidth: 200,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const AnimatedIconButton = styled(motion.div)({
  display: 'inline-flex',
});

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontWeight: 600,
    fontSize: '0.75rem',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
  },
}));

export const Navbar = ({ isProductList = false }) => {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const userInfo = useSelector(selectUserInfo);
  const cartItems = useSelector(selectCartItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemClick = (to) => {
    handleCloseUserMenu();
    navigate(to);
  };

  const handleToggleFilters = () => {
    dispatch(toggleFilters());
  };

  const MenuItemWithIcon = ({ icon, children, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <StyledMenuItem onClick={onClick}>
        <Stack direction="row" alignItems="center" spacing={1.5} width="100%">
          <div style={{ display: 'flex', alignItems: 'center', color: theme.palette.text.secondary }}>
            {icon}
          </div>
          <Typography 
            variant="body2" 
            color="text.primary" 
            sx={{ 
              fontWeight: 500,
              fontSize: '0.875rem',
              letterSpacing: '0.025em'
            }}
          >
            {children}
          </Typography>
        </Stack>
      </StyledMenuItem>
    </motion.div>
  );

  const settings = [
    { name: 'Home', to: '/', icon: <HomeIcon fontSize="small" /> },
    ...(loggedInUser ? [
      {
        name: 'Profile',
        to: loggedInUser?.isAdmin ? '/admin/profile' : '/profile',
        icon: <PersonIcon fontSize="small" />
      },
      {
        name: loggedInUser?.isAdmin ? 'Orders' : 'My orders',
        to: loggedInUser?.isAdmin ? '/admin/orders' : '/orders',
        icon: <ShoppingBagIcon fontSize="small" />
      },
      { name: 'Logout', to: '/logout', icon: <LogoutIcon fontSize="small" /> }
    ] : [
      { name: 'Login', to: '/login', icon: <LoginIcon fontSize="small" /> }
    ])
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'white', 
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)', 
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar sx={{ 
        p: { xs: 1, md: 2 }, 
        height: '4rem', 
        display: 'flex', 
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '1.5rem',
              background: 'linear-gradient(45deg,rgb(0, 0,rgb(0, 0, 0)a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MERN SHOP
          </Typography>
        </motion.div>

        {/* Mobile Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            display: { xs: 'flex', md: 'none' },
            fontWeight: 700,
            color: 'primary.main',
            textDecoration: 'none',
            fontSize: '1.2rem',
          }}
        >
          MS
        </Typography>

        {/* Right Section */}
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 2 }}>
          {/* User Avatar & Menu */}
          <Tooltip title="Account settings" arrow>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar 
                  alt={userInfo?.name || "User"} 
                  src={null}
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </motion.div>
          </Tooltip>

          <StyledMenu
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {loggedInUser?.isAdmin && (
              <MenuItemWithIcon
                icon={<AddIcon fontSize="small" />}
                onClick={() => handleMenuItemClick('/admin/add-product')}
              >
                Add Product
              </MenuItemWithIcon>
            )}
            
            {settings.map((setting) => (
              <MenuItemWithIcon
                key={setting.name}
                icon={setting.icon}
                onClick={() => handleMenuItemClick(setting.to)}
              >
                {setting.name}
              </MenuItemWithIcon>
            ))}
          </StyledMenu>

          {/* User Greeting */}
          {!isMobile && userInfo?.name && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontWeight: 400,
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {is480 ? userInfo.name.split(" ")[0] : `Hey 👋 ${userInfo.name.split(" ")[0]}`}
            </Typography>
          )}

          {/* Admin Badge */}
          {loggedInUser?.isAdmin && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="contained" 
                size="small"
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)',
                  }
                }}
              >
                Admin
              </Button>
            </motion.div>
          )}

          {/* Action Icons */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Cart */}
            {cartItems?.length > 0 && (
              <AnimatedIconButton
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <StyledBadge badgeContent={cartItems.length}>
                  <IconButton 
                    onClick={() => navigate('/cart')}
                    sx={{ 
                      color: 'text.primary',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <ShoppingCartOutlinedIcon />
                  </IconButton>
                </StyledBadge>
              </AnimatedIconButton>
            )}

            {/* Wishlist */}
            {!loggedInUser?.isAdmin && loggedInUser && (
              <AnimatedIconButton
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <StyledBadge badgeContent={wishlistItems?.length || 0}>
                  <IconButton 
                    component={Link} 
                    to="/wishlist"
                    sx={{ 
                      color: 'text.primary',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <FavoriteBorderIcon />
                  </IconButton>
                </StyledBadge>
              </AnimatedIconButton>
            )}

            {/* Filter Toggle
            {isProductList && (
              <AnimatedIconButton
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton 
                  onClick={handleToggleFilters}
                  sx={{ 
                    color: isProductFilterOpen ? 'primary.main' : 'text.primary',
                    backgroundColor: isProductFilterOpen ? 'primary.light' : 'transparent',
                    '&:hover': { 
                      backgroundColor: isProductFilterOpen ? 'primary.light' : 'action.hover' 
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TuneIcon />
                </IconButton>
              </AnimatedIconButton>
            )} */}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};