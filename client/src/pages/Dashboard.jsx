import { Link } from 'react-router-dom';

const Dashboard = () => {
    const arr = ['item One', 'item Two', 'item Three', 'item Four', 'item Five']

    return (
        <div className='home-wrapper'>
            <h1>Hello from Dashboard route!</h1>
            {arr.map((item, index) => (
                <section key={index} className='home-item-wrapper'>
                    <p>----- {item} -----</p>
                </section>
            ))}
        </div>
    )
};

export default Dashboard;