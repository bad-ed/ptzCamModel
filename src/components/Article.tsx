import * as React from 'react';
import { Inline as IM, Block as BM } from './Math';
import { PanTiltModel } from './PanTiltModel';

interface Props {

}

const Content: React.SFC<Props> = (props) => <article>
<h1>Пересчет углов PTZ камеры</h1>

<p>Имея в качестве входных данных:</p><ul>
    <li><IM>\phi</IM> &mdash; текущий угол наклона (<em>tilt</em>)</li>
    <li><IM>\theta</IM> &mdash; текущий угол панорамирования (<em>pan</em>)</li>
    <li><IM>width \times height</IM> &mdash; ширина и высота текущего изображения</li>
    <li><IM>\upsilon_h</IM> &mdash; горизонтальный угол обзора</li>
    <li><IM>x</IM>, <IM>y</IM> &mdash; координаты изображения в пределах <IM>[0;width)</IM> и <IM>[0;height)</IM> соответственно, в которые кликнул пользователь</li>
</ul>

<p>Рассчитать значения углов <IM>\phi^*</IM>, <IM>\theta^*</IM>, при которых точка с координатами <IM>[x,y]</IM> (та, в которую кликнул пользователь) окажется в центре изображения.</p>

<h2>Расчет</h2>
<p>Для начала рассчитаем угол обзора по вертикали:</p>
<BM>{`\\tan{\\upsilon_v\\over 2} = \\tan{\\upsilon_h\\over 2} \\times {height \\over width}`}</BM>

<p>Рассчитаем углы обзора части изображения образованной прямоугольником, один угол которого является центром изображения с камеры, второй угол имеет координаты <IM>[x,y]</IM>. Обозначим угол по горизонтали <IM>\alpha</IM>, по вертикали &mdash; <IM>\beta</IM>.</p>

<p>Для начала рассчитаем смещение точки <IM>[x,y]</IM> относительно центра изображения:</p>
<BM>dx = x - width/2</BM>
<BM>dy = y - height/2</BM>

<p>Зная углы обзора камеры, рассчитаем углы части изображения:</p>
<BM>{'\\tan{\\alpha} = \\tan{\\upsilon_h\\over 2} \\times {dx \\over width/2}'}</BM>
<BM>{'\\tan{\\beta} = \\tan{\\upsilon_v\\over 2} \\times {dy \\over height/2}'}</BM>

</article>;

export const Article: React.SFC<Props> = (props) => (<div className="container-fluid h-100">
    <div className="row">
        <div className="col-6">
            <Content {...props} />
        </div>
        <div className="col-6">
            <div style={{height: '100%'}}>
                <PanTiltModel style={{position: 'sticky', top: 0, height: '100vh'}} />
            </div>
        </div>
    </div>
</div>);
