import { FormattedMessage } from 'react-intl';
import Table from 'react-bootstrap/Table';

const Step5Summary = ({ data }) => {
    return (
        <div className="ct-step-fields">

            <Table borderless className="mb-4" style={{ fontSize: '0.9rem' }}>
                <tbody>
                    <tr className="border-bottom">
                        <td colSpan={2} className="fw-bold bg-light py-2 ps-3" style={{ fontSize: '0.85rem', letterSpacing: '0.03em' }}>
                            <FormattedMessage id="project.tournaments.CreateTournament.step5.section.basicInfo" defaultMessage="Información básica" />
                        </td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2" style={{ width: '200px' }}>
                            <FormattedMessage id="project.tournaments.CreateTournament.step1.name" defaultMessage="Nombre del torneo" />
                        </td>
                        <td className="py-2 fw-medium">{data.nombre || '—'}</td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step1.startDate" defaultMessage="Fecha de inicio" />
                        </td>
                        <td className="py-2">{data.fechaInicio || '—'}</td>
                    </tr>
                    <tr className="border-bottom">
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step1.inscriptionDeadline" defaultMessage="Fecha límite de inscripción" />
                        </td>
                        <td className="py-2">{data.fechaLimiteInscripcion || '—'}</td>
                    </tr>

                    <tr className="border-bottom">
                        <td colSpan={2} className="fw-bold bg-light py-2 ps-3" style={{ fontSize: '0.85rem', letterSpacing: '0.03em' }}>
                            <FormattedMessage id="project.tournaments.CreateTournament.step5.section.format" defaultMessage="Formato" />
                        </td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step2.type" defaultMessage="Tipo de torneo" />
                        </td>
                        <td className="py-2">
                            {data.tipoTorneo === 'LIGA_UNICA' && <FormattedMessage id="project.tournaments.CreateTournament.step2.type.league" defaultMessage="Liga única" />}
                            {data.tipoTorneo === 'GRUPOS_PLAYOFF' && <FormattedMessage id="project.tournaments.CreateTournament.step2.type.groupsPlayoff" defaultMessage="Grupos + Playoff" />}
                            {data.tipoTorneo === 'ELIMINATORIAS' && <FormattedMessage id="project.tournaments.CreateTournament.step2.type.knockout" defaultMessage="Eliminatorias directas" />}
                            {!data.tipoTorneo && '—'}
                        </td>
                    </tr>
                    {(data.numGrupos > 0) && (
                        <tr>
                            <td className="text-secondary ps-3 py-2">
                                <FormattedMessage id="project.tournaments.CreateTournament.step2.numGroups" defaultMessage="Número de grupos" />
                            </td>
                            <td className="py-2">{data.numGrupos}</td>
                        </tr>
                    )}
                    {(data.equiposPorGrupo > 0) && (
                        <tr>
                            <td className="text-secondary ps-3 py-2">
                                <FormattedMessage id="project.tournaments.CreateTournament.step2.teamsPerGroup" defaultMessage="Equipos por grupo" />
                            </td>
                            <td className="py-2">{data.equiposPorGrupo}</td>
                        </tr>
                    )}
                    {data.tipoTorneo === 'GRUPOS_PLAYOFF' && (
                        <tr className="border-bottom">
                            <td className="text-secondary ps-3 py-2">
                                <FormattedMessage id="project.tournaments.CreateTournament.step2.playoffAfterGroups" defaultMessage="Playoff después de fase de grupos" />
                            </td>
                            <td className="py-2">
                                {data.tienePlayoff
                                    ? <FormattedMessage id="project.global.buttons.yes" defaultMessage="Sí" />
                                    : <FormattedMessage id="project.global.buttons.no" defaultMessage="No" />
                                }
                                {data.tienePlayoff && data.idaVueltaPlayoff && (
                                    <span className="text-muted ms-2 small">
                                        (<FormattedMessage id="project.tournaments.CreateTournament.step2.homeAwayPlayoff" defaultMessage="Ida y vuelta" />)
                                    </span>
                                )}
                            </td>
                        </tr>
                    )}

                    <tr className="border-bottom">
                        <td colSpan={2} className="fw-bold bg-light py-2 ps-3" style={{ fontSize: '0.85rem', letterSpacing: '0.03em' }}>
                            <FormattedMessage id="project.tournaments.CreateTournament.step5.section.rules" defaultMessage="Reglas" />
                        </td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step3.winPoints" defaultMessage="Puntos por victoria" />
                        </td>
                        <td className="py-2">{data.puntosVictoria ?? 3}</td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step3.drawPoints" defaultMessage="Puntos por empate" />
                        </td>
                        <td className="py-2">{data.puntosEmpate ?? 1}</td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step3.lossPoints" defaultMessage="Puntos por derrota" />
                        </td>
                        <td className="py-2">{data.puntosDerrota ?? 0}</td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step3.matchFormat" defaultMessage="Formato de partidos" />
                        </td>
                        <td className="py-2">
                            {data.formatoPartidos === '4_SETS' && <FormattedMessage id="project.tournaments.CreateTournament.step3.matchFormat.4sets" defaultMessage="4 sets (liga)" />}
                            {data.formatoPartidos === '5_SETS' && <FormattedMessage id="project.tournaments.CreateTournament.step3.matchFormat.5sets" defaultMessage="5 sets (playoff)" />}
                            {!data.formatoPartidos && '—'}
                        </td>
                    </tr>
                    <tr className="border-bottom">
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step3.tiebreaker" defaultMessage="Criterio de desempate" />
                        </td>
                        <td className="py-2">{data.criterioDesempate || '—'}</td>
                    </tr>

                    <tr className="border-bottom">
                        <td colSpan={2} className="fw-bold bg-light py-2 ps-3" style={{ fontSize: '0.85rem', letterSpacing: '0.03em' }}>
                            <FormattedMessage id="project.tournaments.CreateTournament.step5.section.calendar" defaultMessage="Calendario" />
                        </td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.availableDays" defaultMessage="Días disponibles" />
                        </td>
                        <td className="py-2">
                            {(data.diasDisponibles || []).length > 0
                                ? (data.diasDisponibles || []).join(', ')
                                : '—'
                            }
                        </td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.startTime" defaultMessage="Hora de inicio" />
                        </td>
                        <td className="py-2">{data.horaInicio || '—'}</td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.endTime" defaultMessage="Hora de fin" />
                        </td>
                        <td className="py-2">{data.horaFin || '—'}</td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.matchDuration" defaultMessage="Duración del partido" />
                        </td>
                        <td className="py-2">{data.duracionPartido || '—'} min</td>
                    </tr>
                    <tr>
                        <td className="text-secondary ps-3 py-2">
                            <FormattedMessage id="project.tournaments.CreateTournament.step4.distribution" defaultMessage="Estrategia de distribución" />
                        </td>
                        <td className="py-2">
                            {data.estrategiaDistribucion === 'JORNADAS' && <FormattedMessage id="project.tournaments.CreateTournament.step4.distribution.matchdays" defaultMessage="Jornadas" />}
                            {data.estrategiaDistribucion === 'RAPIDO' && <FormattedMessage id="project.tournaments.CreateTournament.step4.distribution.fast" defaultMessage="Rápido" />}
                            {!data.estrategiaDistribucion && '—'}
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
};

export default Step5Summary;
