import React, { PureComponent } from 'react';
import { Image, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;


export default class HTMLImage extends PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            width: props.imagesInitialDimensions.width,
            height: props.imagesInitialDimensions.height
        };
    }

    static propTypes = {
        source: PropTypes.object.isRequired,
        alt: PropTypes.string,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        style: Image.propTypes.style,
        imagesMaxWidth: PropTypes.number,
        imagesInitialDimensions: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        })
    }

    static defaultProps = {
        imagesInitialDimensions: {
            width: 100,
            height: 100
        }
    }

    componentDidMount () {
        this.getImageSize();
    }

    componentWillReceiveProps (nextProps) {
        this.getImageSize(nextProps);
    }

    getDimensionsFromStyle (style, height, width) {
        let styleWidth;
        let styleHeight;

        if (height) {
            styleHeight = height;
        }
        if (width) {
            styleWidth = width;
        }
        style.forEach((styles) => {
            if (!width && styles['width']) {
                styleWidth = styles['width'];
            }
            if (!height && styles['height']) {
                styleHeight = styles['height'];
            }
        });
        return { styleWidth, styleHeight };
    }

    getImageSize (props = this.props) {
        const { source, imagesMaxWidth, style, height, width } = props;
        const { styleWidth, styleHeight } = this.getDimensionsFromStyle(style, height, width);

        if (styleWidth && styleHeight) {
            return this.setState({
                width: typeof styleWidth === 'string' && styleWidth.search('%') !== -1 ? styleWidth : parseInt(styleWidth, 10),
                height: typeof styleHeight === 'string' && styleHeight.search('%') !== -1 ? styleHeight : parseInt(styleHeight, 10)
            });
        }
        // Fetch image dimensions only if they aren't supplied or if with or height is missing
        Image.getSize(
            source.uri,
            (originalWidth, originalHeight) => {
                if (!imagesMaxWidth) {
                    return this.setState({ width: originalWidth, height: originalHeight });
                }
                const optimalWidth = imagesMaxWidth <= originalWidth ? imagesMaxWidth : originalWidth;
                const optimalHeight = (optimalWidth * originalHeight) / originalWidth;
                this.setState({ width: optimalWidth, height: optimalHeight, error: false });
            },
            () => {
                this.setState({ error: true });
            }
        );
    }

    validImage (source, style, props = {}) {
        return (
            <Image
              source={source}
              resizeMethod='resize'
              style={[style, { width: this.moderateScale(250), height: this.moderateScale(250), resizeMode: 'contain' }]} 
              {...props}
            />
        );
    }

    get errorImage () {
        return (
            <View style={{ width: 50, height: 50, borderWidth: 1, borderColor: 'lightgray', overflow: 'hidden', justifyContent: 'center' }}>
                { this.props.alt ? <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>{ this.props.alt }</Text> : false }
            </View>
        );
    }

    render () {
        const { source, style, passProps } = this.props;

        return !this.state.error ? this.validImage(source, style, passProps) : this.errorImage;
    }


//Guideline sizes are based on standard ~5" screen mobile device

scale = size => width / guidelineBaseWidth * size;
verticalScale = size => height / guidelineBaseHeight * size;
moderateScale = (size, factor = 0.5) => size + ( this.scale(size) - size ) * factor;
}
