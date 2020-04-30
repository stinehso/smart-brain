import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';



const particlesOptions = {
	particles: {
		number: {
			value: 40,
			density: {
				enable: true,
				value_area: 800
			}
		},
		line_linked: {
			shadow: {
				enable: true,
				color: "#3CA9D1",
				blur: 5
			}
		}
	}
}

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
	constructor() {
		super();
		this.state = initialState;
	}

    loadUser = (data) => {
        this.setState({user: {
            id: data.id,
            name: data.name,
            email: data.email,
            entries: data.entries,
            joined: data.joined
        }})
    }

    componentDidMount() {
        fetch('https://desolate-plateau-02589.herokuapp.com/')
            .then(response => response.json())
            .then(console.log)
    }

	calculateFaceLocation = (data) => {
		const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputImage');
		const width = Number(image.width);
		const height = Number(image.height);

		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - (clarifaiFace.right_col * width),
			bottomRow: height - (clarifaiFace.bottom_row * height)
		}
	}

	displayFaceBox = (box) => {
		this.setState({box: box});
	}

	onInputChange = (event) => {
		this.setState({input: event.target.value});
	}

	onImageSubmit = () => {
		this.setState({imageUrl: this.state.input});

        fetch('https://desolate-plateau-02589.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
        })
        .then(response => response.json())
		.then(response => {
            if (response) {
                fetch('https://desolate-plateau-02589.herokuapp.com/image', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: this.state.user.id
                    })
                })
                .then(response => response.json())
                .then(count => {
                    this.setState(Object.assign(this.state.user, { entries: count }))
                })
            }
            this.displayFaceBox(this.calculateFaceLocation(response))
        })
		.catch(err => console.log(err));
	}

    onRouteChange = (route) => {
        if (route === 'signout') {
            this.setState(initialState)
            console.log(this.state);
        } else if (route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route})
    }

	render() {
        const { isSignedIn, route, imageUrl, box } = this.state;
		return (
			<div className="App">
				<Particles
					className='particles'
					params={particlesOptions}
				/>
				<Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
                { route === 'home'
                    ? <React.Fragment>
        				<Logo />
        				<Rank
                            name={this.state.user.name}
                            entries={this.state.user.entries} />
        				<ImageLinkForm
        					onInputChange={this.onInputChange}
        					onSubmit={this.onImageSubmit}
        				/>
        				<FaceRecognition box={box} imageUrl={imageUrl} />
                    </React.Fragment>

                    : (route === 'register')
                        ? <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                        : <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                }
			</div>
		);
	}
}

export default App;
