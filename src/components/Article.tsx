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

<p>Рассмотрим "виртуальную" сферу. Пусть центр сферы находится в точке крепления поворотной камеры. Также представим, что изображение с камеры получается путем пересечения лучей, выпущенных из центра сферы под углами <IM>\upsilon_h</IM> и <IM>\upsilon_v</IM>. Для простоты расчетов будем полагать, что радиус сферы равен единице.</p>

<p>Точка <IM>C</IM>, лежащая на поверхности сферы &mdash; центр изображения. Координаты точки <IM>C</IM>:</p>

<BM>{`\\begin{cases}
    x = \\cos{\\phi}\\sin{\\theta}\\\\
    y = \\sin{\\phi}\\\\
    z = \\cos{\\phi}\\cos{\\theta}
\\end{cases}`}</BM>

<p>Перейдем в систему координат <IM>X', Y', Z'</IM>, в которой точка <IM>C</IM> будет иметь координаты <IM>{`\\{x'=0; y'=0; z'=1\\}`}</IM>.</p>

<p>Рассмотрим треугольник <IM>OCA</IM>: <IM>\angle OCA = 90^\circ</IM>, <IM>OC=1</IM> (радиус сферы), следовательно <IM>OA=OC / \cos\alpha = 1/\cos\alpha</IM></p>

<p>Рассмотрим треугольник <IM>ODA</IM>: <IM>DA=BC=\tan\beta</IM> (т.к. <IM>ABCD</IM> &mdash; прямоугольник). Отсюда вычисляем: </p>
<BM>{`\\tan{\\beta'}={DA \\over OA}=\\tan\\beta\\cos\\alpha`}</BM>

<p>Рассчитаем координаты точки <IM>D'</IM>, которая является проекцией точки <IM>D</IM> на сферу. Опустим перпендикуляр из точки <IM>D'</IM> на отрезок <IM>OA</IM>, <IM>E</IM> &mdash; точка пересечения этих отрезков. Треугольник <IM>OED'</IM> помогает найти координату <IM>{`y'=\\sin{\\beta'}`}</IM> и <IM>{`OE=\\cos{\\beta'}`}</IM>. Отрезок <IM>OE</IM> лежит в плоскости <IM>OX'Z'</IM>, следовательно <IM>{`x'=OE\\cdot\\sin\\alpha=\\cos{\\beta'}\\sin\\alpha`}</IM>, <IM>{`z'=OE\\cdot\\sin\\alpha=\\cos{\\beta'}\\cos\\alpha`}</IM>. В итоге получаем:</p>

<BM>{`D'=
\\begin{cases}
    x' = \\cos{\\beta'}\\sin{\\alpha}\\\\
    y' = \\sin{\\beta'}\\\\
    z' = \\cos{\\beta'}\\cos{\\alpha}
\\end{cases}`}
</BM>

<p>Перейдем обратно в систему координат <IM>XYZ</IM>. Для этого повернем точку <IM>D'</IM> сначала вокруг оси <IM>OX'</IM> на угол <IM>\phi</IM>, затем вокруг оси <IM>OY'</IM> на угол <IM>\theta</IM>. После поворота на <IM>\phi</IM> вокруг оси <IM>OX'</IM> получаем следующие координаты:</p>

<BM>{`D'=
\\begin{cases}
    x' = \\cos{\\beta'}\\sin{\\alpha}\\\\
    y = \\sin{\\beta'}\\cos\\phi + \\cos{\\beta'}\\cos\\alpha\\sin\\phi\\\\
    z^* = \\cos{\\beta'}\\cos\\alpha\\cos\\phi - \\sin{\\beta'}\\sin\\phi
\\end{cases}`}
</BM>

<p>Рассмотрим поворот вокруг оси <IM>OY</IM>:</p>
<BM>
    x = x'\cos\theta + z^*\sin\theta\\
    z = z^*\cos\theta - x\sin\theta
</BM>

<p>Точка <IM>D'</IM> лежит на поверхности сферы, следовательно :</p>
<BM>{`D'=\\begin{cases}
    x' = \\cos{\\phi^*}\\sin{\\theta'}\\\\
    y = \\sin{\\phi^*}\\\\
    z^* = \\cos{\\phi^*}\\cos{\\theta'}
\\end{cases}`}</BM>

<p>Подставляя <IM>x'</IM> и <IM>z^*</IM> в уравнения выше, получаем:</p>
<BM>
    x = \cos\phi^*(\sin\theta'\cos\theta+\cos\theta'\sin\theta) = \cos\phi^*\sin(\theta+\theta')\\
    z = \cos\phi^*(\cos\theta'\cos\theta-\sin\theta'\sin\theta) = \cos\phi^*\cos(\theta+\theta')
</BM>

<p>Упрощая координату <IM>y</IM>, получаем:</p>
<BM>{"y = {\\sin\\beta'\\over\\sin\\beta}\\sin(\\beta+\\phi)"}</BM>

<div style={{display: 'none'}}>
    <BM>{`
        y = \\sin\\beta'\\cos\\phi + \\cos\\beta'\\cos\\alpha\\sin\\phi = \\\\
            \\cos\\beta'\\big(\\tan\\beta'\\cos\\phi + \\cos\\alpha\\sin\\phi\\big) =
            \\cos\\beta'\\cos\\alpha\\big(\\tan\\beta\\cos\\phi + \\sin\\phi\\big) = \\\\
            {\\cos\\beta'\\cos\\alpha\\over\\cos\\beta}\\big(\\sin\\beta\\cos\\phi+\\cos\\beta\\sin\\phi\\big)=
            {\\sin\\beta'\\cos\\alpha\\over\\tan\\beta\\cos\\alpha\\cos\\beta}\\sin(\\beta+\\phi)=\\\\
            {\\sin\\beta'\\over\\sin\\beta}\\sin(\\beta+\\phi)
    `}</BM>
</div>

<p>С другой стороны <IM>y = \sin\phi^*</IM>, откуда получаем:</p>
<BM>{"\\phi^* = \\arcsin\\left({\\sin\\beta'\\over\\sin\\beta}\\sin(\\beta+\\phi)\\right)"}</BM>

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
