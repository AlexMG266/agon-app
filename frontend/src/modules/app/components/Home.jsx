import { FormattedMessage } from 'react-intl';

const Home = () => (
    <div className="text-center py-5 mt-5">
        <h1 className="fw-bold mb-3" style={{ fontSize: '3.5rem', letterSpacing: '-0.03em' }}>
            Agón.
        </h1>
        <p className="text-muted fs-4">
            <FormattedMessage id="project.app.Home.welcome" defaultMessage="Bienvenido a la mejor plataforma de competición." />
        </p>
    </div>
);

export default Home;
