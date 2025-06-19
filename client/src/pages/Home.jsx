import { Link } from 'react-router-dom';

// import './Home.css';

const Home = () => {
    const arr = ['item One', 'item Two', 'item Three', 'item Four', 'item Five']

    return (
        <div className='home-wrapper'>
            <h1>Hello from Home route!</h1>
            {arr.map((item, index) => (
                <section key={index} className='home-item-wrapper'>
                    <p>----- {item} -----</p>
                </section>
            ))}
        </div>
    )
};

export default Home;