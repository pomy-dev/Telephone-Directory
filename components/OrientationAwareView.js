import React, { useContext } from 'react';
import { View } from 'react-native';
import { AppContext } from '../context/appContext';

export const OrientationAwareView = ({ children, portraitStyle, landscapeStyle, ...props }) => {
  const { isLandscape } = useContext(AppContext);

  return (
    <View
      style={[
        props.style,
        portraitStyle,
        isLandscape && landscapeStyle,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};